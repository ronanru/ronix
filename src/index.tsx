/* @refresh reload */
import '@fontsource-variable/inter';
import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

render(() => <App />, document.getElementById('root') as HTMLElement);
