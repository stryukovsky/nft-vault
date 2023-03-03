import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftVault } from "../target/types/nft_vault";
import { createMint, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert, expect } from "chai";

/**
 * NOTE: run firstly `solana-test-validator`,
 * then run `solana airdrop 10 FjA2eGqDBA8xGSCdisgG5AEwfuQaGYyKJT5ZDyPRRNGo --url http://localhost:8899`
 * then run `anchor test --skip-local-validator`
 * */
describe("nft-vault", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.NftVault as Program<NftVault>;

    // const tokenPublicKey = "EDEPPgLTtyK1RBHtJFG15MJs2eb5fn8GhLsP3edyVMKp";
    // const tokenAccount = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(
    //     [51, 185, 42, 141, 35, 241, 59, 62, 137, 161, 49, 77, 70, 60, 71, 184, 24, 255, 5, 21, 12, 246, 78,
    //         159, 44, 11, 249, 5, 176, 124, 240, 122, 196, 74, 9, 16, 135, 210, 104, 223, 57, 41,
    //         210, 149, 2, 178, 128, 161, 115, 29, 52, 249, 139, 0, 107, 139, 198, 123, 172, 129,
    //         76, 109, 79, 179]));
    // assert(tokenAccount.publicKey.toBase58() == tokenPublicKey, "token account initialization failed"); // this is used to guarantee you use accounts properly

    const mint = anchor.web3.Keypair.generate();

    const payerPublicKey = "FjA2eGqDBA8xGSCdisgG5AEwfuQaGYyKJT5ZDyPRRNGo";
    const payer = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(
        [53, 196, 144, 231, 38, 16, 40, 129, 121, 186, 68, 15, 60, 186, 179, 12, 85, 166, 155, 0, 83, 180, 8, 200, 222, 36,
            100, 43, 50, 136, 212, 137, 218, 208, 56, 36, 104, 178, 85, 81, 82, 49, 74, 228, 161, 16, 100,
            162, 245, 220, 97, 187, 63, 148, 100, 56, 43, 65, 103, 45, 118, 10, 116, 136]));
    assert(payer.publicKey.toBase58() == payerPublicKey, "payer account initialization failed"); // this is used to guarantee you use accounts properly

    const connection = anchor.getProvider().connection;

    const mintAuthority = payer;
    const freezeAuthority = payer;
    const decimals = 0; //NFT

    it("should start with payer's balance > 3 SOL", async () => {
        const balance = await connection.getBalance(payer.publicKey);
        expect(balance).greaterThan(3 * anchor.web3.LAMPORTS_PER_SOL);
    });

    // let mint: anchor.web3.PublicKey;
    it("should initialize mint", async () => {
        // mint = await createMint(connection, payer, mintAuthority.publicKey, freezeAuthority.publicKey, decimals);
        await program.methods.initializeMint().accounts({
            mint: mint.publicKey,
            payer: payer.publicKey,
        }).signers([mint, payer]).rpc();
    });

    let tokenAccount: anchor.web3.PublicKey;
    it("should initialize account", async () => {
        tokenAccount = (await getAssociatedTokenAddress(mint.publicKey, payer.publicKey));
    });

    it("should perform mint", async () => {
        await program.methods.performMint(new anchor.BN(123)).accounts({
            tokenAccount: tokenAccount,
            mint: mint.publicKey,
            authority: payer.publicKey,
        }).signers([payer]).rpc();
    });
});
