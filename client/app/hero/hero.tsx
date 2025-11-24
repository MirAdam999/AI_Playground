import './hero.css'
import { roundedFont, blackOpsFont } from '@/comps/fonts';

export default function Hero() {
    return (
        <div id='hero'>
            <div className="side left">
                <h2 className={`${roundedFont.className} model`} id='smol'>SmolLM3</h2>
            </div>

            <div className="center">
                <h1 className={`${blackOpsFont.className} vs`}>VS</h1>
            </div>

            <div className="side right">
                <h2 className={`${roundedFont.className} model`} id='arch'>Arch-Router</h2>
            </div>
        </div>
    )
}