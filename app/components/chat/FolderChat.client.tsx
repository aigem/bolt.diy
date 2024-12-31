import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useMessageParser } from '~/lib/hooks';
import { description, useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, PROVIDER_LIST, WORK_DIR } from '~/utils/constants';
import { BaseChat } from './BaseChat';
import { webcontainer } from '~/lib/webcontainer';

export function FolderChat() {
    const { ready, initialMessages, storeMessageHistory, importChat, exportChat } = useChatHistory();
    const title = useStore(description);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        workbenchStore.setReloadedMessages(initialMessages.map((m) => m.id));
    }, [initialMessages]);

    useEffect(() => {
        // 初始化工作区
        workbenchStore.setShowWorkbench(true);

        // 监听 WebContainer 初始化
        webcontainer.then(() => {
            toast.success('工作区初始化成功！');
        }).catch((error) => {
            console.error('工作区初始化失败:', error);
            toast.error('工作区初始化失败');
        });
    }, []);

    const { messages, isLoading, input, handleInputChange, setInput, stop, append, setMessages } = useChat({
        api: '/api/chat',
        body: {
            workDir: WORK_DIR,
            contextOptimization: true,
        },
        initialMessages,
    });

    const { parsedMessages, parseMessages } = useMessageParser();

    useEffect(() => {
        chatStore.setKey('started', initialMessages.length > 0);
    }, []);

    useEffect(() => {
        if (messages.length > initialMessages.length) {
            storeMessageHistory(messages).catch((error) => toast.error(error.message));
        }
        parseMessages(messages, isLoading);
    }, [messages, isLoading, parseMessages]);

    const handleStop = () => {
        stop();
        chatStore.setKey('aborted', true);
        workbenchStore.abortAllActions();
    };

    const handleSendMessage = useCallback(
        async (event: React.UIEvent) => {
            event.preventDefault();
            if (!input.trim() || isLoading) return;

            try {
                await append({
                    role: 'user',
                    content: input,
                });
            } catch (error) {
                console.error('发送消息失败:', error);
                toast.error('发送消息失败');
            }
        },
        [append, input, isLoading]
    );

    return (
        <>
            {ready && (
                <BaseChat
                    textareaRef={textareaRef}
                    input={input}
                    showChat={true}
                    chatStarted={true}
                    isStreaming={isLoading}
                    sendMessage={handleSendMessage}
                    model={DEFAULT_MODEL}
                    provider={DEFAULT_PROVIDER}
                    providerList={PROVIDER_LIST}
                    handleInputChange={handleInputChange}
                    handleStop={handleStop}
                    description={title}
                    importChat={importChat}
                    exportChat={exportChat}
                    messages={messages.map((message, i) => {
                        if (message.role === 'user') {
                            return message;
                        }
                        return {
                            ...message,
                            content: parsedMessages[i] || '',
                        };
                    })}
                />
            )}
        </>
    );
} 