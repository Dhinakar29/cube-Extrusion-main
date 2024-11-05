import { useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import {createCube ,createButton, createTextBlock, computeNormalInCameraSpace, computeExtrusionLength, calculateDistanceBetweenOppositeFaces, performExtrusion, calculateActualExtrusionLength} from './utils.js';

export default function Cube(){

	useEffect(()=>{
		
		let canvas = document.getElementById("myCanvas");
		let engine = new BABYLON.Engine(canvas, true);
		let scene = new BABYLON.Scene(engine);
		let camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
		camera.setPosition(new BABYLON.Vector3(0, 0, 5));
		camera.attachControl(canvas, true);
		let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene);
		let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	
		let textBlock = createTextBlock(
			"Cube Extrusion", 
			GUI.Control.HORIZONTAL_ALIGNMENT_CENTER, 
			GUI.Control.VERTICAL_ALIGNMENT_TOP
		);
		advancedTexture.addControl(textBlock);
	
		let resetButton = createButton(
			"..\reset.png",
			"Reset", 
			GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT, 
			GUI.Control.VERTICAL_ALIGNMENT_TOP
		);
	
		let cube;
		let pickedFace = null;
		let initialPointerX;
		let initialPointerY;
		let initialVertices;
		let cameraSpaceNormal;
		let distanceBetweenOppositeFaces;
		let indices;
	
		const init = () => {
			cube = createCube(scene);
			indices = cube.getIndices();
			
			scene.onPointerDown = (evt, pickingInfo) => {	//handler for selecting a face
				if(!pickingInfo.hit) {
					return;
				}
				pickedFace = Math.floor(pickingInfo.faceId/2);
				console.log(pickedFace);
				switch(pickedFace){							//for illumination purpose
					case 0:
						light.setDirectionToTarget(new BABYLON.Vector3(0, 0, 10));
						break;
					case 1:
						light.setDirectionToTarget(new BABYLON.Vector3(0, 0, -10));
						break;
					case 2:
						light.setDirectionToTarget(new BABYLON.Vector3(10, 0, 0));
						break;
					case 3:
						light.setDirectionToTarget(new BABYLON.Vector3(-10, 0, 0));
						break;
					case 4:
						light.setDirectionToTarget(new BABYLON.Vector3(0, 10, 0));
						break;
					case 5:
					light.setDirectionToTarget(new BABYLON.Vector3(0, -10, 0));
					break;
				}
				camera.detachControl(canvas);
				initialPointerX = scene.pointerX;
				initialPointerY = scene.pointerY;
				initialVertices = cube.getVerticesData(BABYLON.VertexBuffer.PositionKind);
				cameraSpaceNormal = computeNormalInCameraSpace(initialVertices, pickedFace, camera);
				distanceBetweenOppositeFaces = calculateDistanceBetweenOppositeFaces(pickedFace, initialVertices);
			}

			scene.onPointerMove = () => {
				if(pickedFace == null) {
					return;
				}
				let extrusionLength =  computeExtrusionLength(initialPointerX, scene.pointerX, initialPointerY, scene.pointerY, cameraSpaceNormal, pickedFace);
				let actualExtrusionLength = calculateActualExtrusionLength(pickedFace, extrusionLength);
				extrusionLength = (pickedFace === 1 || pickedFace === 2 || pickedFace === 5) ? (-1) * extrusionLength : extrusionLength;
	
				if(distanceBetweenOppositeFaces + actualExtrusionLength <= 0){
					return;
				}
				performExtrusion(cube, initialVertices, pickedFace, indices, extrusionLength);
			}

			scene.onPointerUp = () => {
				if(pickedFace == null){
					return;
				}
				pickedFace = null;
				camera.attachControl(canvas);
			}
		}

		resetButton.onPointerUpObservable.add( () => {
			cube.dispose();
			pickedFace = null;
			init();
		});
		advancedTexture.addControl(resetButton);
	
		init();
	
		engine.runRenderLoop(function () {
			scene.render();
		});
	
		window.addEventListener("resize", function () {
			engine.resize();
		});
	}, []);

	return(
		<div>
			<canvas id='myCanvas' width={window.innerWidth * 0.8} height={window.innerHeight * 0.8}>
			</canvas>
		</div>
	)
}