import { NgZone, Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

declare var cast:any;

@Injectable()

export class CastService {
    private messageWatch:any = new Subject();
    message$:any = this.messageWatch.asObservable();

    castReceiverManager: any;
    messageBus: any;
    ngZone: any;
    senderId: any;
    name: string;

    constructor(zone: NgZone) {
        this.ngZone = zone;
    } 

    init(): void { 
        cast.receiver.logger.setLevelValue(0);
        this.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        console.log('Starting Receiver Manager');

        this.castReceiverManager.onReady = this.onReady.bind(this);
        this.castReceiverManager.onSenderConnected = this.onSenderConnected.bind(this);
        this.castReceiverManager.onSenderDisconnected = this.onSenderDisconnected.bind(this);
        this.castReceiverManager.onSystemVolumeChanged = this.onSystemVolumeChanged.bind(this);

        this.messageBus = 
        this.castReceiverManager.getCastMessageBus(process.env.NAMESPACE);

        // handler for the CastMessageBus message event
        this.messageBus.onMessage = this.onMessage.bind(this);

        // initialize the CastReceiverManager with an application status message
        this.castReceiverManager.start({statusText: "Application is starting"});
        console.log('Receiver Manager started');
    }

    onReady(event:any) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        this.castReceiverManager.setApplicationState("Application status is ready...");
    }

    onSenderConnected(event:any) {
        console.log('Received Sender Connected event: ' + event.data);
        let sender = this.castReceiverManager.getSender(event.data);
        this.ngZone.run(() => {
            this.senderId = sender.id;
        });
    }

    onSenderDisconnected(event:any) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (this.castReceiverManager.getSenders().length === 0) {
        }
    }

    onSystemVolumeChanged(event:any) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
              event.data['muted']);
    }

    onMessage(event:any) {
        console.log('Message [' + event.senderId + ']: ' + event.data); 
        let data = JSON.parse(event.data);
        this.name = data.name || 'Chromecast Sender';
        this.displayData(data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        this.messageBus.send(event.senderId, this.name);
    }

    displayData(data:any) {
        this.ngZone.run(() => {
            this.messageWatch.next(data);
        });
        this.castReceiverManager.setApplicationState(this.name);
    }

    sendToSender(data:any) {
        this.messageBus.send(this.senderId, JSON.stringify(data));
    }
}