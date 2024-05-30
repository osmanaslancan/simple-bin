package main

import (
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type bin struct {
	ID      uuid.UUID
	Content string
}

type binCreateDto struct {
	Content string `json:"content"`
}

type binDto struct {
	ID      string `json:"id"`
	Content string `json:"content"`
}

func prefixedDataDir(file string) string {
	return "data/" + file + ".txt"
}

func main() {
	os.Mkdir("data", 0777)

	godotenv.Load(".env.dev")

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		MaxAge: 12 * time.Hour,
	}))

	router.Static("/assets", "./www/assets/")
	router.StaticFile("/pastebin.svg", "./www/pastebin.svg")
	api := router.Group("/api")
	api.Use(tokenCheck)
	{
		api.POST("/bin/create", createBin)
	}

	router.GET("/api/bin/get/:id", getBinByID)

	router.NoRoute(func(c *gin.Context) {
		c.File("./www/index.html")
	})

	if os.Getenv("GIN_MODE") == "release" {
		router.Run("0.0.0.0:8080")
	} else {
		router.Run("localhost:8080")
	}
}

func tokenCheck(c *gin.Context) {
	bearer := c.GetHeader("Authorization")

	if !strings.HasPrefix(bearer, "Bearer ") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	token := strings.TrimPrefix(bearer, "Bearer ")

	if token != os.Getenv("API_TOKEN") {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	c.Next()

}

func createBin(c *gin.Context) {
	var dto binCreateDto

	if err := c.BindJSON(&dto); err != nil {
		return
	}

	if dto.Content == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	guid := uuid.New()

	bin := bin{
		ID:      guid,
		Content: dto.Content,
	}

	file, err := os.Create(prefixedDataDir(guid.String()))

	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	file.WriteString(bin.Content)
	file.Close()

	c.IndentedJSON(http.StatusCreated, binDto{
		ID:      bin.ID.String(),
		Content: bin.Content,
	})
}

func getBinByID(c *gin.Context) {
	id := c.Param("id")

	guid, error := uuid.Parse(id)

	if error != nil {
		c.Status(http.StatusNotFound)
		return
	}

	file, error := os.Open(prefixedDataDir(guid.String()))

	if error != nil {
		c.Status(http.StatusNotFound)
		return
	}

	content, error := io.ReadAll(file)

	if error != nil {
		c.AbortWithStatus(http.StatusNotFound)
		return
	}

	c.IndentedJSON(http.StatusOK, binDto{
		ID:      guid.String(),
		Content: string(content),
	})
}
