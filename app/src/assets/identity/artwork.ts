import btc from './crypto/btc.png';
import eth from './crypto/eth.png';
import sol from './crypto/sol.png';
import usdc from './crypto/usdc.png';
import usdt from './crypto/usdt.png';
import xrp from './crypto/xrp.png';
import bnb from './crypto/bnb.png';
import xlm from './crypto/xlm.png';
import lsk from './crypto/lsk.png';
import hype from './crypto/hype.png';
import juno from './crypto/juno.png';
import ksm from './crypto/ksm.png';
import lunc from './crypto/lunc.png';
import hpe from './markets/HPE.png';
import dell from './markets/DELL.png';
import crwd from './markets/CRWD.png';
import orcl from './markets/ORCL.png';
import nflx from './markets/NFLX.png';
import spx from './markets/SPX.png';
import ndx from './markets/NDX.png';
import gala from '../coin-logos/gala.svg';
import us from './flags/us.svg';
import eu from './flags/eu.svg';
import gb from './flags/gb.svg';

const CRYPTO_ARTWORK: Record<string, { src: string; onPlate: boolean }> = {
  btc: { src: btc, onPlate: false },
  eth: { src: eth, onPlate: true },
  sol: { src: sol, onPlate: false },
  usdc: { src: usdc, onPlate: false },
  usdt: { src: usdt, onPlate: false },
  xrp: { src: xrp, onPlate: true },
  bnb: { src: bnb, onPlate: false },
  xlm: { src: xlm, onPlate: true },
  gala: { src: gala, onPlate: true },
  lsk: { src: lsk, onPlate: false },
  hype: { src: hype, onPlate: false },
  juno: { src: juno, onPlate: false },
  ksm: { src: ksm, onPlate: true },
  lunc: { src: lunc, onPlate: false },
};

const FIAT_FLAGS: Record<string, string> = { USD: us, EUR: eu, GBP: gb };
const MARKET_ARTWORK: Record<string, { src: string; onPlate: boolean }> = {
  hpe: { src: hpe, onPlate: false },
  dell: { src: dell, onPlate: false },
  crwd: { src: crwd, onPlate: false },
  orcl: { src: orcl, onPlate: false },
  nflx: { src: nflx, onPlate: false },
  spx: { src: spx, onPlate: false },
  ndx: { src: ndx, onPlate: false },
};
const FOREX_FLAGS: Record<string, readonly [string, string]> = {
  eurusd: [eu, us],
  gbpusd: [gb, us],
};

export function cryptoArtwork(id: string) { return CRYPTO_ARTWORK[id.toLowerCase()]; }
export function marketArtwork(id: string) { return MARKET_ARTWORK[id.toLowerCase()]; }
export function fiatFlag(code: string) { return FIAT_FLAGS[code.toUpperCase()]; }
export function forexFlags(id: string) { return FOREX_FLAGS[id.toLowerCase()]; }

export function requiredCryptoArtwork(id: string): string {
  const artwork = cryptoArtwork(id);
  if (!artwork) throw new Error(`Missing crypto artwork for ${id}`);
  return artwork.src;
}
