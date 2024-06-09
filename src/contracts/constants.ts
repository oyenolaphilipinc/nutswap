import { Address } from '@ton/core';

class Op {
    static swap_ton_to_jetton = 1092;
    static swap_jetton_to_jetton = 1093;
    static swap_jetton_to_ton = 1094;
    static transfer_notification = 0x7362d09c;
    static transfer = 0xf8a7ea5;
    static make_swap_ton = 1029;
    static retrieve_fee = 1030;
    static retrieved_fee = 1031;
    static update_referral = 1032;
    static initialize_swap_wallet = 1033;
    static update_fees = 1034;
    static change_admin = 1035;
    static change_co_admin = 1036;
    static withdraw_ton = 1037;
    static withdraw_jetton = 1038;
}

const swapRootAddress = Address.parse(
    'EQDgGkavcO0Tb5yJV2fDwJu3DTDNyAqsEpNApCYEfhvgdvAA',
);

export { Op, swapRootAddress };
