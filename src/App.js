
import { DocumentViewerProvider } from './document-viewer-provider';
import SignatureTab from './signature-tab';

function App() {
	return (
		<DocumentViewerProvider>
			<SignatureTab />
		</DocumentViewerProvider>
	);
}

export default App;
