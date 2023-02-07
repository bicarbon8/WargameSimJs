export class GameEventManager {
    private _subscriptions: Map<string, (...args: Array<any>) => void>;
    private _emitter: Phaser.Events.EventEmitter;

    /**
     * notifies all listeners of the specified event sending them the passed
     * in `args` array
     * @param event the event being emitted
     * @param args arguments for the event
     * @returns `this`
     */
    notify(event: string, ...args: Array<any>): this {
        this._emitter.emit(event, ...args);
        return this;
    }

    /**
     * subscribes to the specified `event` and optionally will check the result of the 
     * passed in `condition` to ensure the `owner` should be notified (`func` should be
     * executed)
     * @param owner the name of the subscription owner
     * @param event the event to subscribe to
     * @param func the function to be called when the specified event is emitted
     * @param condition a condition to be checked before calling the `func` function @default `() => true`
     * @returns `this`
     */
    subscribe(owner: string, event: string, func: (...args: Array<any>) => void, condition?: () => boolean): this {
        condition ??= () => true;
        const key = this._subscriptionKey(owner, event);
        this._subscriptions.set(key, (...args: Array<any>) => {
            if (condition()) {
                func(...args);
            }
        });
        this._emitter.on(event, (args: Array<any>) => {
            if (this._subscriptions.has(key)) {
                this._subscriptions.get(key)();
            }
        });
        return this;
    }

    /**
     * unsubscribes the owner from all events or the specified `event` if supplied
     * @param owner the name of the subscription owner
     * @param event an optional event to limit the removal of subscriptions 
     * @returns `this`
     */
    unsubscribe(owner: string, event?: string): this {
        if (event) {
            const key = this._subscriptionKey(owner, event);
            this._subscriptions.delete(key);
        } else {
            const keys = Array.from(this._subscriptions.keys());
            for (const key of keys) {
                if (key.startsWith(this._subscriptionKey(owner, ''))) {
                    this._subscriptions.delete(key);
                }
            }
        }
        return this;
    }

    /**
     * unsubscribes all subscribers from all events
     * @returns `this`
     */
    unsubscribeAll(): this {
        this._emitter.removeAllListeners();
        this._subscriptions.clear();
        return this;
    }

    private _subscriptionKey(owner: string, event: string): string {
        return `${owner}-${event}`;
    }
}