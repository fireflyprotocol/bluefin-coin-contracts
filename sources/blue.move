
module bluefin_coin::blue {

    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url;

    /// Name of the coin. By convention, this type has the same name as its parent module
    /// and has no fields
    struct BLUE has drop {}


    /// Maximum supply of BLUE coins that will ever be in circulation (1 billion)
    const MAX_SUPPLY: u64 = 1_000_000_000_000_000_000;

    /// Triggered when the more coins than max supply are attempted to be minted
    const EMaxSupplyReached: u64 = 1;
    
    /// Register the BLUE currency to acquire its `TreasuryCap`. Because
    /// this is a module initializer, it ensures the currency only gets
    /// registered once.
    fun init(witness: BLUE, ctx: &mut TxContext) {
        // Get a treasury cap for the coin and give it to the transaction sender
        let (treasury_cap, metadata) = coin::create_currency<BLUE>(
            witness, 
            9, 
            b"BLUE", // symbol 
            b"Bluefin Coin", // name
            b"Bluefin foundation coin earned by trading on the Bluefin protocol and used to partake in governance proposals", 
            option::some(url::new_unsafe_from_bytes(b"https://bluefin.io/images/bluefin-logo.svg")), // temporary url
            ctx
            );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx))
    }

    /// Manager can mint new coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<BLUE>, amount: u64, recipient: address, ctx: &mut TxContext
    ) {
        // The total supply can never be > max supply
        let total_supply = coin::total_supply(treasury_cap);
        assert!(total_supply + amount <= MAX_SUPPLY, EMaxSupplyReached);

        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }

    /// Manager can burn coins
    public entry fun burn(treasury_cap: &mut TreasuryCap<BLUE>, coin: Coin<BLUE>) {
        coin::burn(treasury_cap, coin);
    }


}
