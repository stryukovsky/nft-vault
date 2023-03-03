import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftVault } from "../target/types/nft_vault";
import { getAssociatedTokenAddress } from "@solana/spl-token";

/**
 * NOTE: run firstly `solana-test-validator`,
 * then run `solana airdrop 10 FjA2eGqDBA8xGSCdisgG5AEwfuQaGYyKJT5ZDyPRRNGo --url http://localhost:8899`
 * then run `anchor test --skip-local-validator`
 * */
describe("nft-vault", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.NftVault as Program<NftVault>;
    const mint = anchor.web3.Keypair.generate();
    const ownerPublicKey = anchor.getProvider().publicKey;
    
    it("should mint token", async () => {
        const tokenAccountPublicKey = await getAssociatedTokenAddress(mint.publicKey, ownerPublicKey);
        await program.methods.mintNft(new anchor.BN(123)).accounts({
            mint: mint.publicKey,
            tokenAccount: tokenAccountPublicKey,
        }).signers([mint]).rpc();
    });
});
