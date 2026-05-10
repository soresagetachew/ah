import { Response } from 'express';

class SSEService {
  private clients: { id: string; res: Response }[] = [];

  constructor() {
    // Keep connections alive with a ping every 30 seconds
    setInterval(() => {
      this.broadcast('ping', { time: Date.now() });
    }, 30000);
  }

  addClient(id: string, res: Response) {
    res.write('retry: 10000\n\n');
    this.clients.push({ id, res });
    
    res.on('close', () => {
      this.clients = this.clients.filter(c => c.id !== id);
    });
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(c => {
      try {
        c.res.write(payload);
      } catch (err) {
        console.error('Failed to write to client:', c.id);
      }
    });
  }
}

export const sseService = new SSEService();
