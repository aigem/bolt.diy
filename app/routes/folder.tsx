import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { FolderChat } from '~/components/chat/FolderChat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { Workbench } from '~/components/workbench/Workbench.client';

export const meta: MetaFunction = () => {
    return [
        { title: 'Bolt - 项目聊天' },
        { name: 'description', content: '与你的项目进行智能对话' }
    ];
};

export const loader = () => json({});

export default function FolderChatPage() {
    return (
        <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
            <BackgroundRays />
            <Header />
            <div className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
                <div className="flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full">
                    <ClientOnly fallback={<BaseChat />}>{() => <FolderChat />}</ClientOnly>
                </div>
                <ClientOnly>{() => <Workbench chatStarted={true} />}</ClientOnly>
            </div>
        </div>
    );
} 