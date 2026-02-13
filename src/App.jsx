import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code2, Github, Users, Wifi, WifiOff, LogOut, MessageSquareOff, MessageSquare, Power, Crown } from 'lucide-react';
import WorkspaceLayout from './components/Layout/WorkspaceLayout';
import ChatPanel from './components/Chat/ChatPanel';
import VoiceRoom from './components/VoiceCall/VoiceCall';
import ParticipantsPanel from './components/Participants/ParticipantsPanel';
import codeExecutionService from './services/codeExecutionService';
import {
  initSocket, isConnected, joinRoom, leaveRoom, disconnect, getSocketId,
  onRoomState, onUserJoined, onUserLeft, onConnect, onDisconnect,
  sendTerminalOutput, onTerminalOutput, onHostChanged, onYouWereKicked,
  onSessionEnded, onChatToggled, toggleChat, endSession, onIntentUpdate
} from './services/socket';
import './App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // host stuff
  const [hostSocketId, setHostSocketId] = useState(null);
  const [chatDisabled, setChatDisabled] = useState(false);

  // intent-aware collab
  const [userIntents, setUserIntents] = useState({});

  // room state for late joiners
  const [initialRoomState, setInitialRoomState] = useState(null);

  // execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [currentFilename, setCurrentFilename] = useState('main.py');
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('python');
  const [stdin, setStdin] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get('guest') === 'true';
    const token = isGuest ? null : localStorage.getItem('token');

    const socketInstance = initSocket(token);

    const onRoomStateReceived = (data) => {
      setCurrentRoom({ roomId: data.roomId });
      setRoomUsers(data.users || []);
      setInitialRoomState(data.state);
      setIsConnecting(false);

      if (data.hostSocketId) setHostSocketId(data.hostSocketId);
      if (data.chatDisabled !== undefined) setChatDisabled(data.chatDisabled);
      if (data.state?.terminalHistory) setTerminalHistory(data.state.terminalHistory);
    };

    const onJoined = (data) => {
      console.log('user joined:', data.user.username);
      setRoomUsers(data.users || []);
      if (data.hostSocketId) setHostSocketId(data.hostSocketId);
    };

    const onLeft = (data) => {
      console.log('user left:', data.user.username);
      setRoomUsers(data.users || []);
      if (data.hostSocketId) setHostSocketId(data.hostSocketId);
    };

    const onHostChange = (d) => {
      setHostSocketId(d.hostSocketId);
    };

    const onKicked = (d) => {
      alert(`You were kicked from the room by ${d.by}`);
      setCurrentRoom(null);
      setRoomUsers([]);
      setHostSocketId(null);
      navigate('/');
    };

    const onSessionEnd = (d) => {
      alert(`Session ended by host (${d.by})`);
      setCurrentRoom(null);
      setRoomUsers([]);
      setHostSocketId(null);
      navigate('/');
    };

    const onChatToggle = (d) => {
      setChatDisabled(d.disabled);
    };

    const onSockConnect = () => setSocketConnected(true);
    const onSockDisconnect = () => setSocketConnected(false);

    const onRemoteOutput = (data) => {
      if (data.entry) {
        setTerminalHistory(prev => {
          if (prev.some(e => e.id === data.entry.id)) return prev;
          return [...prev, data.entry].slice(-50);
        });
      }
    };

    // register all event listeners
    const unsubs = [
      onRoomState(onRoomStateReceived),
      onUserJoined(onJoined),
      onUserLeft(onLeft),
      onConnect(onSockConnect),
      onDisconnect(onSockDisconnect),
      onTerminalOutput(onRemoteOutput),
      onHostChanged(onHostChange),
      onYouWereKicked(onKicked),
      onSessionEnded(onSessionEnd),
      onChatToggled(onChatToggle),
      onIntentUpdate((data) => {
        setUserIntents(prev => ({
          ...prev,
          [data.socketId]: data.intent?.key || data.intent
        }));
      })
    ];

    return () => unsubs.forEach(fn => fn());
  }, []);

  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlRoomId && !currentRoom && !isConnecting) {
      handleJoinRoom(urlRoomId);
    }
  }, [urlRoomId, currentRoom, isConnecting]);

  const handleJoinRoom = useCallback((roomId) => {
    setIsConnecting(true);

    const params = new URLSearchParams(window.location.search);
    const isGuest = params.get('guest') === 'true';
    const token = isGuest ? null : localStorage.getItem('token');

    initSocket(token);

    // wait for connection then join
    setTimeout(() => {
      if (isConnected()) {
        joinRoom(roomId);
      } else {
        const interval = setInterval(() => {
          if (isConnected()) {
            clearInterval(interval);
            joinRoom(roomId);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          if (!isConnected()) {
            setIsConnecting(false);
            alert('Failed to connect. Please try again.');
          }
        }, 10000);
      }
    }, 500);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    setCurrentRoom(null);
    setRoomUsers([]);
    setInitialRoomState(null);
    setTerminalHistory([]);
    navigate('/');
  }, [navigate]);

  const handleCodeChange = (code, language) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  };

  const handleExecute = async (code, language) => {
    setIsExecuting(true);
    setCurrentCode(code);
    setCurrentLanguage(language);

    const extMap = { python: '.py', javascript: '.js', cpp: '.cpp', java: '.java', c: '.c' };
    const filename = `main${extMap[language] || '.txt'}`;
    setCurrentFilename(filename);

    try {
      const result = await codeExecutionService.executeCode(code, language, stdin);

      const entry = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        filename, language,
        output: result.output || '',
        error: result.error || '',
        exitCode: result.exitCode ?? (result.success ? 0 : 1),
        executionTime: result.executionTime || 0,
        success: result.success
      };

      setTerminalHistory(prev => [...prev, entry].slice(-50));
      if (currentRoom) sendTerminalOutput(entry);

    } catch (err) {
      const entry = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        filename, language,
        output: '', error: `Error: ${err.message}`,
        exitCode: 1, executionTime: 0, success: false
      };

      setTerminalHistory(prev => [...prev, entry].slice(-50));
      if (currentRoom) sendTerminalOutput(entry);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteWithStdin = () => {
    if (currentCode) handleExecute(currentCode, currentLanguage);
  };

  const handleClearTerminal = () => setTerminalHistory([]);

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">
            {isConnecting ? 'Joining workspace...' : 'Connecting...'}
          </h2>
          <p className="text-gray-500">Setting up your collaborative environment</p>
        </div>
      </div>
    );
  }

  const localUser = roomUsers.find(u => u.socketId === getSocketId());
  const currentUserName = localUser ? localUser.username : 'You';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-container">
            <Code2 className="logo-icon" />
          </div>
          <h1 className="app-title">Codebridge</h1>
          <span className="beta-badge">Beta</span>
        </div>

        <div className="header-right">
          <ParticipantsPanel
            roomUsers={roomUsers}
            hostSocketId={hostSocketId}
            isHost={hostSocketId === getSocketId()}
            userIntents={userIntents}
          />

          <div className="room-info">
            <span className="room-info-code">{currentRoom.roomId}</span>
            <div className="room-info-users">
              <Users size={14} />
              <span>{roomUsers.length}</span>
            </div>
          </div>

          <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
            {socketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{socketConnected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {hostSocketId === getSocketId() && (
            <>
              <button
                className={`host-control-btn ${chatDisabled ? 'active' : ''}`}
                onClick={() => toggleChat(!chatDisabled)}
                title={chatDisabled ? 'Enable Chat' : 'Disable Chat'}
              >
                {chatDisabled ? <MessageSquareOff size={16} /> : <MessageSquare size={16} />}
              </button>
              <button
                className="host-control-btn end-session"
                onClick={() => {
                  if (confirm('Are you sure you want to end the session for everyone?')) {
                    endSession();
                  }
                }}
                title="End Session"
              >
                <Power size={16} />
              </button>
            </>
          )}

          <button className="leave-room-btn" onClick={handleLeaveRoom}>
            <LogOut size={14} />
            Leave
          </button>

          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="header-icon-btn">
            <Github size={20} />
          </a>
        </div>
      </header>

      <WorkspaceLayout
        isExecuting={isExecuting}
        terminalHistory={terminalHistory}
        currentFilename={currentFilename}
        stdin={stdin}
        onStdinChange={setStdin}
        onExecuteWithStdin={handleExecuteWithStdin}
        onClearTerminal={handleClearTerminal}
        onCodeChange={handleCodeChange}
        onExecute={handleExecute}
        roomId={currentRoom.roomId}
        roomUsers={roomUsers}
        initialState={initialRoomState}
      />

      <VoiceRoom roomId={currentRoom.roomId} userName={currentUserName} />
      <ChatPanel roomId={currentRoom.roomId} disabled={chatDisabled} />
    </div>
  );
}

export default App;
