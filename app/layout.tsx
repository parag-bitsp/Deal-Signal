import type {Metadata} from 'next';
import './globals.css';
import './layout-refinement.css';
import './call-traces.css';
import './feedback.css';
import ModalBehavior from '../components/modal-behavior';
export const metadata:Metadata={title:'DealSignal | Sales Intelligence',description:'Customer evidence behind every forecast. A synthetic sales intelligence demonstration.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<ModalBehavior/></body></html>}
