# WebSocket & Real-time Connection Guide

## Overview

The application uses Supabase Realtime for WebSocket connections with automatic reconnection logic.

## Features

- Automatic reconnection with exponential backoff
- Connection status monitoring
- Real-time updates for agents, tasks, and workflows
- Toast notifications for connection events
- Manual reconnection option

## Connection Management

### useRealtimeConnection Hook

The main hook for managing WebSocket connections:

\`\`\`typescript
import { useRealtimeConnection } from '@/lib/hooks/use-realtime-connection'

function MyComponent() {
  const {
    status,           // 'connecting' | 'connected' | 'disconnected' | 'error'
    isConnected,      // boolean
    isConnecting,     // boolean
    reconnectAttempts,// number
    reconnect,        // () => void
    disconnect,       // () => void
  } = useRealtimeConnection({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onError: (error) => console.error(error),
    maxReconnectAttempts: 5,
    reconnectInterval: 3000,
  })

  return (
    <div>
      Status: {status}
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  )
}
\`\`\`

## Reconnection Strategy

### Exponential Backoff

The reconnection logic uses exponential backoff to avoid overwhelming the server:

1. First attempt: 3 seconds
2. Second attempt: 6 seconds
3. Third attempt: 12 seconds
4. Fourth attempt: 24 seconds
5. Fifth attempt: 48 seconds

After 5 failed attempts, the connection gives up and shows an error.

### Configuration

Default settings:

\`\`\`typescript
{
  maxReconnectAttempts: 5,     // Max reconnection tries
  reconnectInterval: 3000,     // Base interval in ms
}
\`\`\`

## Real-time Updates

### Subscribing to Changes

\`\`\`typescript
import { createClient } from '@/lib/supabase/client'
import { useRealtimeConnection } from '@/lib/hooks/use-realtime-connection'

function useRealtimeData() {
  const { isConnected } = useRealtimeConnection()
  const [data, setData] = useState([])

  useEffect(() => {
    if (!isConnected) return

    const supabase = createClient()
    
    const channel = supabase
      .channel('my_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'my_table',
        },
        (payload) => {
          // Handle INSERT, UPDATE, DELETE
          handleChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isConnected])

  return data
}
\`\`\`

## UI Components

### RealtimeStatus

Shows connection status in the UI:

\`\`\`typescript
import { RealtimeStatus } from '@/components/realtime-status'

function Header() {
  return (
    <header>
      <RealtimeStatus />
    </header>
  )
}
\`\`\`

Displays:
- Green "Live" badge when connected
- Gray "Connecting..." with spinner
- Red "Offline" when disconnected
- Popover with reconnect button and details

### ConnectionToast

Automatic toast notifications for connection events:

\`\`\`typescript
import { ConnectionToast } from '@/components/connection-toast'

function App() {
  return (
    <>
      <ConnectionToast />
      {/* Your app content */}
    </>
  )
}
\`\`\`

## Troubleshooting

### Connection Keeps Dropping

1. Check Supabase project status
2. Verify environment variables
3. Check network stability
4. Increase reconnect attempts:

\`\`\`typescript
useRealtimeConnection({
  maxReconnectAttempts: 10,
  reconnectInterval: 5000,
})
\`\`\`

### No Real-time Updates

1. Ensure connection is established (check status)
2. Verify table has proper RLS policies
3. Check Supabase Realtime is enabled for table
4. Confirm channel subscription succeeded

### High CPU Usage

If reconnection happens too frequently:

1. Increase reconnection interval
2. Reduce number of channels
3. Unsubscribe from unused channels

## Best Practices

1. **Always check connection status** before subscribing
2. **Clean up subscriptions** in useEffect cleanup
3. **Handle all connection states** in UI
4. **Provide manual reconnect** option for users
5. **Show loading states** during reconnection
6. **Log connection events** for debugging

## Performance

- Channels are lightweight
- Automatic cleanup prevents memory leaks
- Exponential backoff prevents server overload
- Connection state is shared across components

## Security

- Uses Supabase RLS policies
- Requires authentication for protected tables
- Connection authenticated via session token
- No sensitive data in WebSocket messages
\`\`\`
