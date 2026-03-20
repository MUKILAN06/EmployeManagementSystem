import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Send, Users, User, Hash, Plus, 
  Search, Info, MoreVertical, Paperclip, Smile, X, Check
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState({ type: 'community', id: 'global', name: 'Community Chat' });
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const scrollRef = useRef(null);

  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    fetchInitialData();
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      connectHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);

        // Community Subscription
        client.subscribe('/topic/community', (msg) => {
          const body = JSON.parse(msg.body);
          if (selectedChatRef.current.type === 'community') {
            setMessages(prev => [...prev, body]);
          }
        });

        // Private Subscription (Standard Spring User Destination)
        client.subscribe('/user/queue/messages', (msg) => {
          const body = JSON.parse(msg.body);
          const current = selectedChatRef.current;
          if (current.type === 'private' && (body.sender.id === current.id || body.recipient.id === current.id)) {
            setMessages(prev => [...prev, body]);
          }
        });

        // Group Subscriptions (Will need to re-subscribe if new groups are joined, but for now we subscribe to existing)
        api.get(`/chat/groups/${user.id}`).then(res => {
          res.data.forEach(group => {
            client.subscribe(`/topic/group/${group.id}`, (msg) => {
              const body = JSON.parse(msg.body);
              if (selectedChatRef.current.type === 'group' && selectedChatRef.current.id === group.id) {
                setMessages(prev => [...prev, body]);
              }
            });
          });
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
      }
    });

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.username]); // Only reconnect if user identity changes

  useEffect(() => {
      fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchInitialData = async () => {
    try {
      const usersRes = await api.get('/users/all');
      setContacts(usersRes.data.filter(u => u.id !== user.id));
      const groupsRes = await api.get(`/chat/groups/${user.id}`);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
      try {
          let res;
          if (selectedChat.type === 'community') {
              res = await api.get('/chat/community');
          } else if (selectedChat.type === 'private') {
              res = await api.get(`/chat/private/${user.id}/${selectedChat.id}`);
          } else if (selectedChat.type === 'group') {
              res = await api.get(`/chat/group/${selectedChat.id}`);
          }
          setMessages(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !stompClient || !connected) return;

    const payload = {
      content: input,
      sender: { id: user.id, username: user.username },
      timestamp: new Date().toISOString()
    };

    if (selectedChat.type === 'community') {
      stompClient.publish({
        destination: '/app/community.send',
        body: JSON.stringify(payload)
      });
    } else if (selectedChat.type === 'private') {
      payload.recipient = { id: selectedChat.id };
      stompClient.publish({
        destination: '/app/private.send',
        body: JSON.stringify(payload)
      });
    } else if (selectedChat.type === 'group') {
      payload.group = { id: selectedChat.id };
      stompClient.publish({
        destination: '/app/group.send',
        body: JSON.stringify(payload)
      });
    }

    setInput('');
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    try {
      await api.post('/chat/groups/create', {
        name: newGroupName,
        creatorId: user.id,
        memberIds: selectedMembers
      });
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedMembers([]);
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] relative bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex">
      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Create New Group</h3>
              <button onClick={() => setShowCreateGroup(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Project Developers"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Members</label>
                <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                  {contacts.map(contact => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleMember(contact.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedMembers.includes(contact.id) 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-100 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold uppercase">
                          {contact.username[0]}
                        </div>
                        <span className="font-bold text-sm">{contact.username}</span>
                      </div>
                      {selectedMembers.includes(contact.id) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                Create Community Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6">
          <h1 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Messages</h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {/* Community Chat */}
          <button 
            onClick={() => setSelectedChat({ type: 'community', id: 'global', name: 'Community Chat' })}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedChat.id === 'global' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <div className={`p-2 rounded-xl ${selectedChat.id === 'global' ? 'bg-blue-500' : 'bg-blue-50 text-blue-600'}`}>
              <Users size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm">Community Chat</p>
              <p className={`text-xs ${selectedChat.id === 'global' ? 'text-blue-100' : 'text-slate-400'}`}>Global messages</p>
            </div>
          </button>

          <div className="pt-4 pb-2 px-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Groups</span>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                <Plus size={14} />
              </button>
            </div>
            {groups.map(group => (
              <button 
                key={group.id}
                onClick={() => setSelectedChat({ type: 'group', id: group.id, name: group.name })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat.id === group.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Hash size={16} className={selectedChat.id === group.id ? 'text-blue-400' : 'text-slate-400'} />
                <span className="font-semibold text-sm">{group.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Direct Messages</span>
            {contacts.map(contact => (
              <button 
                key={contact.id}
                onClick={() => setSelectedChat({ type: 'private', id: contact.id, name: contact.username })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat.id === contact.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold uppercase text-slate-500">
                  {contact.username[0]}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="font-semibold text-sm truncate">{contact.username}</p>
                  <p className="text-[10px] opacity-60 truncate">{contact.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {selectedChat.type === 'community' ? <Users size={20} /> : selectedChat.type === 'group' ? <Hash size={20} /> : <User size={20} />}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{selectedChat.name}</h2>
              <p className={`text-xs font-bold flex items-center gap-1 ${connected ? 'text-green-500' : 'text-amber-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {connected ? 'Real-time Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><Search size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><Info size={20} /></button>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {messages.map((msg, idx) => {
            const isMe = msg.sender.id === user.id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1">
                    {msg.sender.username} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
                <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                  isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {isMe && (
                   <span className="text-[10px] font-bold text-slate-400 mt-1 mr-1">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-100">
          <form onSubmit={sendMessage} className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-14 pr-32 py-4 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
              <button type="button" className="p-1 hover:text-blue-500 text-slate-400 transition-colors"><Smile size={20} /></button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button type="button" className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 transition-all"><Paperclip size={20} /></button>
              <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
