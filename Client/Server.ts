export default class Server {
	static connected: boolean = false;
	static socket: WebSocket;
	static calls: Map<number, any>;
	static lastId: number;

	static start(): Promise<void> {
		if (this.connected) return;
		return new Promise<void>((resolve, reject) => {
			this.calls = new Map();
			this.lastId = 0;
			this.socket = new WebSocket('ws://' + window.location.host + '/');
			this.socket.onopen = (event) => {
				this.connected = true;
				resolve();
			};
			this.socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				this.calls[data.callid](data.ret);
			};
		});
	}

	static async call(func: string, args: any): Promise<any> {
		await this.start();
		return new Promise((resolve, reject) => {
			args.func = func;
			args.callid = ++this.lastId;
			this.socket.send(JSON.stringify(args));
			this.calls[this.lastId] = resolve;
		});
	}

	static async sources(id: string): Promise<any> {
		return await this.call('sources', {id: id});
	}

	static async source(id: string, file: string): Promise<any> {
		return await this.call('source', {id: id, file: file});
	}

	static async setSource(id: string, file: string, content: string): Promise<any> {
		return await this.call('setSource', {id: id, file: file, content: content});
	}
}