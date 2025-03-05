export interface Log {
    time: number;
    level: string;
    name: string;
    msg: string;
  }

  export interface BetObject{
    betAmount : number,
    game_id:string,
    bet_id:string,
    user_id:string,
    txnId:string,
    matchId:string,
    final_amount:number
  }

  export interface WebhookData {
    amount: string;
    txn_id: string;
    ip: string;
    game_id: string;
    user_id: string;
    description?: string;
    bet_id?: string;
    txn_type?: number;
    txn_ref_id?: string;
  }

  export interface BetPostData {
    webhookData: WebhookData;
    token: string;
    socketId?: string;
  }

  export interface BetObj  {
    betAmount:number,
    bet_id:string,
    token:string,
    socket_id: string,
    game_id:string,
    matchId: string,
  }

  export interface PlayerDetails{
    
  }
  export interface GameLog{
    betObj:BetObj,
    logId:string,
    player:PlayerDetails
  }