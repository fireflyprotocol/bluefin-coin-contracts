
module bluefin_coin::blue {

    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use std::option;
    use sui::transfer;
    use sui::url;

    /// Name of the coin. By convention, this type has the same name as its parent module
    /// and has no fields
    struct BLUE has drop {}

    struct TreasuryCapHolder<phantom T> has key, store {
        id: UID,
        treasury: TreasuryCap<T>
    }
    
    /// Maximum supply of BLUE coins that will ever be in circulation (1 billion)
    const MAX_SUPPLY: u64 = 1_000_000_000_000_000_000;

    /// Triggered when the more coins than max supply are attempted to be minted
    const EMaxSupplyReached: u64 = 1;
    /// Triggered when invoking the deprecated methods
    const EDeprecated: u64 = 2;
    
    /// Register the BLUE currency to acquire its `TreasuryCap`. Because
    /// this is a module initializer, it ensures the currency only gets
    /// registered once.
    fun init(witness: BLUE, ctx: &mut TxContext) {
        // Get a treasury cap for the coin and give it to the transaction sender
        let (treasury_cap, metadata) = coin::create_currency<BLUE>(
            witness, 
            9, 
            b"BLUE", // symbol 
            b"Bluefin", // name
            b"Bluefin foundation coin earned by trading on the Bluefin protocol and used to partake in governance proposals", 
            option::some(url::new_unsafe_from_bytes(b"https://bluefin.io/images/square.png")), // temporary url
            ctx
            );


        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx))


    }

    /// Deprecated 
    public entry fun mint(
        _: &mut TreasuryCap<BLUE>, _: u64, _: address, _: &mut TxContext
    ) {
       abort EDeprecated
    }

    /// Deprecated 
    public entry fun burn(_: &mut TreasuryCap<BLUE>, _: Coin<BLUE>) {
       abort EDeprecated
    }
    
    /// Allows the current `TreasuryCap` owner to wrap it into `TreasuryCapHolder`
    public entry fun wrap_treasury_cap(treasury: TreasuryCap<BLUE>, ctx: &mut TxContext){

        let holder = TreasuryCapHolder {
            id: object::new(ctx),
            treasury
        };

        transfer::public_transfer(holder, tx_context::sender(ctx))
    }

    /// Allows the holder of `TreasuryCapHolder` to mint BLUE tokens
    public entry fun mint_tokens(
        holder: &mut TreasuryCapHolder<BLUE>, amount: u64, recipient: address, ctx: &mut TxContext
    ) {
        // The total supply can never be > max supply
        let total_supply = coin::total_supply(&holder.treasury);
        assert!(total_supply + amount <= MAX_SUPPLY, EMaxSupplyReached);

        coin::mint_and_transfer(&mut holder.treasury, amount, recipient, ctx)
        
    }

    /// Allows the holder of `TreasuryCapHolder` to burn BLUE tokens
    public entry fun burn_tokens(holder: &mut TreasuryCapHolder<BLUE>, coin: Coin<BLUE>) {
        coin::burn(&mut holder.treasury, coin);
    }
    


}
