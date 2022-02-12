export const etherAddress = "0x0000000000000000000000000000000000000000";

export const decimals = (10 ** 18);

export const ether = (wei) => {
  if (wei) {
    return (wei / decimals)
  }
}

export const tokenFormat = wei => ether(wei);

export const GREEN = 'success';
export const RED = 'danger';

