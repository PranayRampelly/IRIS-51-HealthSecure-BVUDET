import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/sessions')
      .then(res => setSessions(res.data.sessions))
      .finally(() => setLoading(false));
  }, []);

  const revokeSession = async (sessionId: string) => {
    await axios.post('/api/auth/sessions/revoke', { sessionId });
    setSessions(sessions.filter((s: any) => s._id !== sessionId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Active Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>IP</th>
            <th>Created</th>
            <th>Last Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s: any) => (
            <tr key={s._id}>
              <td>{s.device}</td>
              <td>{s.ip}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>{new Date(s.lastActive).toLocaleString()}</td>
              <td>
                <button onClick={() => revokeSession(s._id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 