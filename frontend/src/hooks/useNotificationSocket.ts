'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

export interface BalanceChangeEvent {
  eventType: string;
  accountNumber: string;
  amount: number;
  direction: 'IN' | 'OUT';
  balanceAfter: number;
  counterpartName?: string;
  transactionCode: string;
  description?: string;
  message: string;
  timestamp: string;
}

export function useNotificationSocket(onMessage?: (event: BalanceChangeEvent) => void) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const handleNotification = useCallback((event: BalanceChangeEvent) => {
    // 1. Dispatch custom DOM event for dashboard/balance components to auto-refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('balance-changed', { detail: event }));
      window.dispatchEvent(new CustomEvent('notification-received', { detail: event }));
    }

    // 2. Trigger custom popup toast
    const isIncoming = event.direction === 'IN';
    const formattedAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(event.amount);

    const formattedBalance = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(event.balanceAfter);

    toast(
      isIncoming ? '💰 Biến động số dư: + ' + formattedAmount : '💸 Biến động số dư: - ' + formattedAmount,
      {
        description: `TK: ${event.accountNumber} | ${isIncoming ? 'Từ' : 'Tới'}: ${event.counterpartName || 'N/A'}\nSố dư mới: ${formattedBalance}`,
        duration: 8000,
        className: isIncoming 
          ? '!bg-[#141C2E] !border-emerald-500/60 !text-white' 
          : '!bg-[#141C2E] !border-amber-500/60 !text-white',
      }
    );

    // 3. Callback if provided
    if (onMessageRef.current) {
      onMessageRef.current(event);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8081/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[STOMP]:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.info('Connected to WebSocket STOMP Broker');

        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const event: BalanceChangeEvent = JSON.parse(message.body);
            handleNotification(event);
          } catch (err) {
            console.error('Failed to parse WebSocket notification:', err);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message'], frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [handleNotification]);

  return { client: clientRef.current };
}
