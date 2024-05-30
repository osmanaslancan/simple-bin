import { useLocation, useParams } from "react-router-dom";
import { Button } from "./components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./api";
import { Skeleton } from "./components/ui/skeleton";
import { AxiosError } from "axios";
import { TriangleAlertIcon } from "lucide-react";
import { useToast } from "./components/ui/use-toast";
import { Editor } from "@monaco-editor/react";


export function BinView() {
    const params = useParams();
    const api = useApi();
    const location = useLocation();
    const { toast } = useToast();
    const query = useQuery({
        queryKey: ["test"],
        retry: false,
        queryFn: async () => {
            if (!params.id)
                throw Error("id is requried for this page to work!")

            var response = await api.getBin(params.id);

            if (location.state?.copy == true) {
                await copyLink();
              
            }

            return response.data;
        },
    });

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.toString());
        toast({
            title: "Link Copied",
            description: "Link is in your clipboard!",
            variant: "default"
        })
    }

    if (query.isFetching) {
        return (<div className='flex flex-col h-full'>
            <div className='flex justify-between items-center invisible'>
                <h1 className='text-4xl font-bold pb-4' >Bin</h1>
                <Button type='submit'>
                    Copy Link
                </Button>
            </div>
            <Skeleton className='flex-1' />
        </div>)
    }

    if (query.isError) {
        return (<div className='flex flex-col h-full'>
            <div className='flex justify-between items-center invisible'>
                <h1 className='text-4xl font-bold pb-4' >Bin</h1>
                <Button type='submit'>
                    Copy Link
                </Button>
            </div>
            <div className='flex-1 text-center flex text-5xl items-center justify-center text-destructive'>
                <TriangleAlertIcon className="absolute opacity-25 text-destructive" size={250} />
                {(query.error as AxiosError)?.response?.status == 404 && <span>Bin Not Found</span>}
                {(query.error as AxiosError)?.response?.status != 404 && <span>An Error Occured While Fetching</span>}
            </div>
        </div>)
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='flex justify-between items-center'>
                <h1 className='text-4xl font-bold pb-4' >Bin</h1>
                <Button onClick={copyLink}>
                    Copy Link
                </Button>
            </div>
            <Editor options={{ lineNumbers: "off", readOnly: true }} defaultValue={query.data?.content} theme='vs-dark' className={'flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1e1e1e]'} />
        </div>
    )
}