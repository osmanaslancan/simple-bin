import { Loader2 } from 'lucide-react'
import { Button } from './components/ui/button'
import { useMutation } from '@tanstack/react-query';
import { cn } from './lib/utils';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './components/ui/form';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useApi } from './api';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { useRef } from 'react';
import { AxiosError } from 'axios';

const formSchema = z.object({
  content: z.string({ required_error: "Fill up your bin first!" }).max(10000),
  token: z.string({ required_error: "Token is required" }).min(3),
})

type FormType = z.infer<typeof formSchema>

function App() {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });
  const navigate = useNavigate();
  const api = useApi();
  const formRef = useRef<HTMLFormElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: FormType) => {
      try {
        const response = await api.createBin({ content: data.content }, { token: data.token });

        if (response.status !== 201) {
          throw new Error("An error occurred while creating the bin");
        }

        navigate("/" + response.data.id, {
          state: {
            copy: true
          }
        })
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          form.setError("token", {
            message: "Invalid credentials"
          })
        }
      }
    }
  });

  const content = form.watch("content");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutateAsync(values))} className='flex flex-col h-full' ref={formRef}>
        <div className='flex justify-between items-center'>
          <h1 className='text-4xl font-bold pb-4' >Create Bin</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={mutation.isPending || !(content?.length > 0)}>
                <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", !mutation.isPending && "hidden")} />
                Create & Copy Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Authentication</DialogTitle>
                <DialogDescription>
                  Creadentials are required to create a bin!
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Token
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type='password' id="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => formRef?.current?.requestSubmit()}>Create Bin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <FormItem className='flex-1 flex flex-col pb-1'>
              <FormDescription>
                Fill up your bin with the content you want to share
              </FormDescription>
              <FormControl>
                <Editor {...field} options={{ lineNumbers: "off" }} theme='vs-dark' className={cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1e1e1e]', fieldState.error && "border-red-500")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>

  )
}


export default App
