import { Injectable } from '@angular/core';
import { CastService } from './cast.service';

declare var cast:any;

@Injectable()
export class MessageService {
    constructor(public castService: CastService) { 
        castService.message$.subscribe((text: any) => {
            console.log(text);
        });
    }

    sendToSender(data:any) {
        this.castService.sendToSender(data);
    }
}
