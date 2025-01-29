import WebViewer from '@pdftron/webviewer'
import { useEffect, useRef } from 'react'

import { signatureViewDisabledElement } from '.'
import { useSetDocumentViewer } from '../document-viewer-provider'

const ACTIONS = {
	ADD: 'add',
	DELETE: 'delete',
}

const roundToDecimal = (number, decimalPlaces) => {
	const factor = Math.pow(10, decimalPlaces)
	return Math.round(number * factor) / factor
}

const SignatureTab = () => {
	const viewerRef = useRef(null)
	const setDocumentViewer = useSetDocumentViewer()
	const FILE_URL = './OoPdfFormExample.pdf'
	const no_of_users = 1

	const createInstance = async () => {
		return await WebViewer(
			{
				path: '/lib',
				initialDoc: FILE_URL,
				fullAPI: true,
				disabledElements: signatureViewDisabledElement,
				custom: JSON.stringify({ total_users: no_of_users }),
				licenseKey: 'demo:1680245487881:7de5d0520300000000164962cecdc6c872671e4039d4ff5afff4e0b15b',
			},
			viewerRef.current,
		)
	}

	useEffect(() => {
		if (FILE_URL) {
			createInstance().then((instance) => {
				if (instance?.Core) {


					const { annotationManager, Annotations, documentViewer } = instance.Core
					const { WidgetFlags, Forms, TextWidgetAnnotation, Border, Color } = Annotations
					instance.UI.enableFeatures([instance.UI.Feature.Initials])

					const formFieldCreationManager = annotationManager.getFormFieldCreationManager()
					formFieldCreationManager.startFormFieldCreationMode()

					documentViewer.addEventListener('documentLoaded', () => {
						documentViewer.getAnnotationsLoadedPromise().then(() => {
							annotationManager.addEventListener('annotationChanged', () => {
								setDocumentViewer(instance)
							})
						})
					})

					// start timestamp field insertion with signature field
					annotationManager.addEventListener(
						'annotationChanged',
						(annotations, action, { imported }) => {
							if (imported) {
								return
							}

							const selectedAnnotation = annotations[0]

							// add timestamp annotation here on signature field insertion
							if (
								selectedAnnotation instanceof
								Annotations.SignatureWidgetAnnotation &&
								action === ACTIONS.ADD
							) {
								const fieldName = selectedAnnotation.fieldName

								const [$fieldName, $userRole] = fieldName.split('.')

								const timestampFieldName = [
									$fieldName,
									$userRole,
									'timestamp',
								].join('.')
								// start insertion of timestamp form textfield
								const timestampWidgetflags = new WidgetFlags()

								const field = new Forms.Field(timestampFieldName, {
									type: 'Tx',
									defaultValue: 'timestamp goes here',
									flags: timestampWidgetflags,
								})

								const border = new Border()
								border.color = new Color(0, 0, 0)
								border.width = 1

								const widgetAnnot = new TextWidgetAnnotation(field)
								widgetAnnot.PageNumber = selectedAnnotation.PageNumber
								widgetAnnot.X = selectedAnnotation.X
								widgetAnnot.Y =
									selectedAnnotation.Y +
									roundToDecimal(selectedAnnotation.Height, 2)
								widgetAnnot.Width = 140
								widgetAnnot.Height = 15
								widgetAnnot.border = border

								annotationManager.getFieldManager().addField(field)
								annotationManager.addAnnotation(widgetAnnot)
								annotationManager.drawAnnotationsFromList([widgetAnnot])
								// end insertion of timestamp form textfield
							}

							setDocumentViewer(instance)
						},
					)
					// end timestamp field insertion with signature field

				}
			})
		}
	}, [FILE_URL])

	return (
		<div>
			<h3 className='mb-2 text-lg font-bold'>Signature</h3>
			<p className='text-gray-600'>Signature mapping</p>

			<div className='signature_div_height rounded-md bg-white p-6'>
				<p>In this step you can add signature field to the pdf.</p>
				<div
					className='webviewer signature_height'
					ref={viewerRef}
					style={{ height: '100vh' }}
				/>
			</div>
		</div>
	)
}

export default SignatureTab
