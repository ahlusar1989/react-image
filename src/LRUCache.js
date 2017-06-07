// Citing: https://blogs.dropbox.com/tech/2012/10/caching-in-theory-and-practice/

class Node {
	constructor(key, value) {
	if (typeof key != 'undefined' && key !== null) {
		this.key = key;
	}
	if (typeof value != 'undefined' && value !== null) {
		this.value = value;
	}
		this.prev = null;
		this.next = null;
		}
	}

export default class LRUCache {
	constructor(limit) {
		//"fields"
		this.size = 0;
		typeof limit == 'number' ? (this.limit = limit) : (this.limit = 10);
		this.map = new Map(); //is the surrogate HashMapSet...TODO: implement this as a separate class
		this.head = null;
		this.tail = null;
		this.node = new Node();

		// class instance methods
		this.get = this.get.bind(this);
		this.setHead = this.setHead.bind(this);
		this.remove = this.remove.bind(this);
		this.set = this.set.bind(this);
		this.removeAll = this.removeAll.bind(this);

		this.printToString = this.printToString.bind(this);
		this.convertToJSON = this.convertToJSON.bind(this);
		this.forEach = this.forEach.bind(this);
	}

	get(key) {
		if (this.map[key]) {
			let value = this.map[key].value;
			let node = new Node(key, value);
			this.remove(key);
			this.setHead(node);
			return value;
		} 
		else {
			throw new Error('Key ' + key + ' does not exist in the cache');
		}
	}

	/* Resets the entire cache - Argument limit is optional to be reset */
	removeAll(limit) {
		this.size = 0;
		this.map = {};
		this.head = null;
		this.tail = null;
		if (typeof limit == 'number') {
			this.limit = limit;
		}
	}

	remove(key) {
		let node = this.map[key];
		if (node.prev !== null) {
			node.prev.next = node.next;
		} 
		else {
			this.head = node.next;
		}
		if (node.next !== null) {
			node.next.prev = node.prev;
		} 
		else {
			this.tail = node.prev;
		}
		delete this.map[key];
		this.size--;
	}

	//head, which is the least recently used entry
	setHead(node) {
		// insert node into the head
		node.next = this.head;
		node.prev = null;
		if (this.head !== null) {
			// if have head, we need re-connect node
			// with other nodes older than head
			this.head.prev = node;
		}
		this.head = node;
		if (this.tail === null) {
			// if there is no tail this means this is a
			// first insert, set the tail to node too
			this.tail = node;
		}
		this.size++;
		this.map[node.key] = node;
	}

	set(key, value) {
		let node = new Node(key, value);
		// insert node into the head
		if (this.map[key]) {
			this.map[key].value = node.value;
			//remove the last key
			this.remove(node.key);
		} 
		else {
			if (this.size >= this.limit) {
				// remove the least recently used item
				delete this.map[this.tail.key];
				this.size--;
				this.tail = this.tail.prev;
				this.tail.next = null;
			}
		}
		this.setHead(node);
	}

  /* Traverse through the cache elements using a callback function
	 * Returns args [node element, element number, cache instance] for the callback function to use
	*/
	forEach(callback) {
		let node = this.head;
		let i = 0;
		while (node) {
			callback.apply(this, [node, i, this]);
			i++;
			node = node.next;
		}
  }

		/* Returns a JSON representation of the cache */
	convertToJSON() {
		let json = [];
		let node = this.head;

		while (node) {
			json.push({
				key: node.key,
				value: node.value,
			});
			node = node.next;
		}
		return json;
	}

	/* Returns a String representation of the cache */
	printToString() {
		let s = '';
		let node = this.head;
		while (node) {
			s += String(node.key) + ' : ' + node.value;
			node = node.next;
			if (node) {
				s += '\n';
			}
		}
		return s;
	}
}