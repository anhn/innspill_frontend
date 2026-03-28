import { useWebSocket } from './useWebSocket';
import { API_ENDPOINTS } from '@/config/api';
import { useCallback } from 'react';

export interface PlanningPokerMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'vote_submitted' | 'member_joined' | 'member_left' | 'game_started' | 'game_ended' | 'online_members_update';
  data: any;
  groupId: string;
  timestamp: string;
}

interface UsePlanningPokerWebSocketOptions {
  groupId: string | null;
  userName: string;
  enabled?: boolean;
  onTaskUpdate?: (data: any) => void;
  onMemberStatusChange?: (data: any) => void;
  onGameStatusChange?: (data: any) => void;
  onOnlineMembersUpdate?: (data: any) => void;
}

export function usePlanningPokerWebSocket({
  groupId,
  userName,
  enabled = true,
  onTaskUpdate,
  onMemberStatusChange,
  onGameStatusChange,
  onOnlineMembersUpdate,
}: UsePlanningPokerWebSocketOptions) {
  // Build WebSocket URL with query parameters
  const wsUrl = groupId && userName
    ? `${API_ENDPOINTS.planningPoker.ws}?groupId=${encodeURIComponent(groupId)}&userName=${encodeURIComponent(userName)}`
    : '';

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: PlanningPokerMessage = JSON.parse(event.data);
      console.log('[PlanningPoker WS] Received message:', message.type, message.data);
      
      switch (message.type) {
        case 'task_created':
        case 'task_updated':
        case 'task_deleted':
        case 'vote_submitted':
          onTaskUpdate?.(message.data);
          break;
        case 'member_joined':
        case 'member_left':
          onMemberStatusChange?.(message.data);
          break;
        case 'game_started':
        case 'game_ended':
          onGameStatusChange?.(message.data);
          break;
        case 'online_members_update':
          onOnlineMembersUpdate?.(message.data);
          break;
        default:
          console.warn('[PlanningPoker WS] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[PlanningPoker WS] Failed to parse message:', error, event.data);
    }
  }, [onTaskUpdate, onMemberStatusChange, onGameStatusChange, onOnlineMembersUpdate]);

  const { isConnected, sendMessage, disconnect } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    enabled: enabled && !!groupId && !!userName,
    reconnectInterval: 3000,
  });

  const sendVote = useCallback((taskId: string, vote: number | string) => {
    if (!groupId) return false;
    return sendMessage({
      type: 'vote',
      taskId,
      groupId,
      vote: vote === '?' ? '?' : Number(vote),
    });
  }, [groupId, sendMessage]);

  const joinRoom = useCallback(() => {
    if (groupId && userName) {
      return sendMessage({
        type: 'join',
        groupId,
        userName,
      });
    }
    return false;
  }, [groupId, userName, sendMessage]);

  const leaveRoom = useCallback(() => {
    if (groupId && userName) {
      return sendMessage({
        type: 'leave',
        groupId,
        userName,
      });
    }
    return false;
  }, [groupId, userName, sendMessage]);

  const requestOnlineMembers = useCallback(() => {
    if (groupId) {
      return sendMessage({
        type: 'get_online_members',
        groupId,
      });
    }
    return false;
  }, [groupId, sendMessage]);

  return {
    isConnected,
    sendVote,
    joinRoom,
    leaveRoom,
    requestOnlineMembers,
    disconnect,
  };
}
