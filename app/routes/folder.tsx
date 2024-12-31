import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Workbench } from '~/components/workbench/Workbench.client';
import { FolderWorkspace } from '~/components/workbench/FolderWorkspace.client';

export const meta: MetaFunction = () => {
    return [
        { title: 'Bolt - 项目工作区' },
        { name: 'description', content: '项目开发工作区' }
    ];
};

export const loader = ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const previewUrl = url.searchParams.get('preview');
    return json({ previewUrl });
};

export default function FolderWorkspacePage() {
    return (
        <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
            <BackgroundRays />
            <Header />
            <div className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
                <ClientOnly>{() => <FolderWorkspace />}</ClientOnly>
            </div>
        </div>
    );
} 