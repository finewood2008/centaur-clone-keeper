// Inbox realtime — disabled in local mode (polling via react-query)
export function useInboxRealtime(_onNewInquiry?: () => void, _onNewMessage?: () => void) {
  // No-op: realtime not available with local SQLite backend
  // Data freshness handled by react-query refetchInterval
}
