export class Constants {
    /**
     * Secure containers
     */
    readonly WAIST_POUCH_ID = "5732ee6a24597719ae0c0281";
    readonly ALPHA_CONTAINER_ID = "544a11ac4bdc2d470e8b456a";
    readonly BETA_CONTAINER_ID = "5857a8b324597729ab0a0e7d";
    readonly EPSILON_CONTAINER_ID = "59db794186f77448bc595262";
    readonly GAMMA_CONTAINER_ID = "5857a8bc2459772bad15db29";
    readonly KAPPA_CONTAINER_ID = "5c093ca986f7740a1867ab12";
    readonly SECURE_CONTAINERS = {
        pouch: this.WAIST_POUCH_ID,
        alpha: this.ALPHA_CONTAINER_ID,
        beta: this.BETA_CONTAINER_ID,
        epsilon: this.EPSILON_CONTAINER_ID,
        gamma: this.GAMMA_CONTAINER_ID,
        kappa: this.KAPPA_CONTAINER_ID,
    };

    /**
     * Vanilla Stashes
     */
    readonly STANDARD_STASH = "64f5b9e5fa34f11b380756c0";
    readonly STANDARD_STASH_ID = "566abbc34bdc2d92178b4576";
    readonly LEFT_BEHIND_STASH = "64f5b9e5fa34f11b380756c2";
    readonly LEFT_BEHIND_STASH_ID = "5811ce572459770cba1a34ea";
    readonly PREPARE_FOR_ESCAPE_STASH = "64f5b9e5fa34f11b380756c4";
    readonly PREPARE_FOR_ESCAPE_STASH_ID = "5811ce662459770f6f490f32";
    readonly EDGE_OF_DARKNESS_STASH = "64f5b9e5fa34f11b380756c6";
    readonly EDGE_OF_DARKNESS_STASH_ID = "5811ce772459770e9e5f9532";
    /**
     * Progressive stashes
     */
    readonly STASH_AREA = 3;
    readonly WORKBENCH_AREA = 10;
    readonly PROGRESSIVE_STASH_PREFIX_ID = "trap_progressive_stash_";
    /**
     * Profile Template
     */
    PROFILE_TEMPLATE_NAME = "Trap's Progressive Stash";
}
