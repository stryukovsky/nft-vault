use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, InitializeAccount, Mint, MintTo, Token, TokenAccount};
declare_id!("4CK2h3eYvjf3jWo7MjdttoQZN1hAKpq44o4MBEb6Zh4B");

#[program]
pub mod nft_vault {
    use super::*;

    pub fn initialize_token_account(ctx: Context<InitializeTokenAccount>) -> Result<()> {
        let space = anchor_spl::token::TokenAccount::LEN as u64;
        let lamports = Rent::get()?.minimum_balance(space as usize);

        let ix = anchor_lang::solana_program::system_instruction::create_account(
            &ctx.accounts.authority.key(),
            &ctx.accounts.token_account.key(),
            lamports,
            space,
            &anchor_spl::token::ID,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = InitializeAccount {
            account: ctx.accounts.token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::initialize_account(cpi_ctx)?;
        msg!("Account initialized");
        Ok(())
    }

    pub fn perform_mint(ctx: Context<PerformMint>, amount: u64) -> Result<()> {
        // Create the MintTo struct for our context
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to mint tokens
        mint_to(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Start initializing mint");
        Ok(())
    }
}

#[error_code]
pub enum VaultErrors {
    MintFailed,
}

#[derive(Accounts)]
pub struct InitializeTokenAccount<'info> {
    #[account(mut)]
    pub token_account: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PerformMint<'info> {
   /// CHECK: This is the token that we want to mint
   #[account(mut)]
   pub mint: Account<'info, Mint>,
   pub token_program: Program<'info, Token>,
   /// CHECK: This is the token account that we want to mint tokens to
   #[account(mut)]
   pub token_account: AccountInfo<'info>,
   /// CHECK: the authority of the mint account
   pub authority: Signer<'info>,  
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(init, payer = payer, mint::decimals=0, mint::authority=payer, mint::freeze_authority=payer)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This accounts isn't actually used by instruction
    pub rent: AccountInfo<'info>,
}
