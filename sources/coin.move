
module bluefin_coin::coin {

    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// Name of the coin. By convention, this type has the same name as its parent module
    /// and has no fields. The full type of the coin defined by this module will be `COIN<TUSDC>`.
    struct COIN has drop {}

    /// Register the BLUE currency to acquire its `TreasuryCap`. Because
    /// this is a module initializer, it ensures the currency only gets
    /// registered once.
    fun init(witness: COIN, ctx: &mut TxContext) {
        // Get a treasury cap for the coin and give it to the transaction sender
        let (treasury_cap, metadata) = coin::create_currency<COIN>(
            witness, 
            9, 
            b"BLUE", // symbol 
            b"Bluefin Coin", // name
            b"Bluefin foundation coin used earned by trading/staking on the platform and used to partake in governance proposals", 
            option::none(), // url
            ctx
            );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx))
    }

    /// Manager can mint new coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<COIN>, amount: u64, recipient: address, ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }

    /// Manager can burn coins
    public entry fun burn(treasury_cap: &mut TreasuryCap<COIN>, coin: Coin<COIN>) {
        coin::burn(treasury_cap, coin);
    }


}