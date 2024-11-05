import * as BABYLON from 'babylonjs';
import * as GUI from '@babylonjs/gui';

const createCube = (scene) => {
    let cube = BABYLON.MeshBuilder.CreateBox("box", {
        size: 1,
        updatable: true
   }, scene, true);

   let positions = cube.getVerticesData(BABYLON.VertexBuffer.PositionKind);
   let indices = cube.getIndices();
   cube.dispose();
   cube = new BABYLON.Mesh("box", scene);
   let vertexData = new BABYLON.VertexData();
   vertexData.positions = positions;
   vertexData.indices = indices;	
   vertexData.applyToMesh(cube);
   return cube;
}

const createButton = (name, text, horizontalAlignment, verticalAlignment, width = "10%") => {
    var button = GUI.Button.CreateSimpleButton(name,text);
    button.width = width;
    button.paddingRight = "1%";
    button.paddingTop = "1%";
    button.height = "8%";
    button.color = "white";
    button.fontSize = "4%";
    button.cornerRadius = 5;
    button.background = "gray";
    button.horizontalAlignment = horizontalAlignment;
    button.verticalAlignment = verticalAlignment;
    return button;
}

const createTextBlock = (text, textHorizontalAlignment, textVerticalAlignment) => {
    var textBlock = new GUI.TextBlock();
    textBlock.text = text;
    textBlock.color = "white";
    textBlock.fontSize = "5%";
    textBlock.paddingTop = "1%";
    textBlock.textHorizontalAlignment = textHorizontalAlignment;
    textBlock.textVerticalAlignment = textVerticalAlignment;
    return textBlock;
}

const calculateExtrusionDistance = (initialPositionList, currentPositionList) => {
    let sumOfDeltaSquare = 0;
    for(let itr  = 0; itr < currentPositionList.length; ++itr ){
        sumOfDeltaSquare += Math.pow(initialPositionList[itr] - currentPositionList[itr], 2)
    }
    return Math.sqrt(sumOfDeltaSquare) * 2;
}

const computeNormalInCameraSpace = (initialVertices, pickedFace, camera) => {
    let faceVertices = initialVertices.slice(pickedFace * 12, (pickedFace + 1) * 12);
    let v1 = BABYLON.Vector3.FromArray(faceVertices, 0);
    let v2 = BABYLON.Vector3.FromArray(faceVertices, 3);
    let v3 = BABYLON.Vector3.FromArray(faceVertices, 6);
    let faceNormal = BABYLON.Vector3.Cross(v2.subtract(v1), v3.subtract(v1));
    let cameraSpaceNormal = BABYLON.Vector3.TransformNormal(faceNormal, camera.getWorldMatrix());
    return cameraSpaceNormal;
}

const computeExtrusionLength = (initialPointerX, currentPointerX, initialPointerY, currentPointerY, cameraSpaceNormal, pickedFace) => {
    let deltaPointerX = (currentPointerX - initialPointerX) * 0.01;
    let deltaPointerY = (currentPointerY - initialPointerY) * 0.01;
    if(pickedFace === 1){ // To resolve unusual behavior
        deltaPointerY *= -1;
    }
    let extrusionLength = (deltaPointerX * cameraSpaceNormal._x + deltaPointerY * cameraSpaceNormal._y);
    return extrusionLength;
}

const performExtrusion  = (cube, initialVertices, pickedFace, indices, extrusionLength) => {
    let currentVertices = initialVertices.slice();
    let axis = (Math.floor(pickedFace/2) + 2) % 3;
    for(let i = 0; i < 12; i++){
        currentVertices[faceNoToVerticesMapping[pickedFace][i]* 3 + axis] += extrusionLength;
    }
    let vertexData = new BABYLON.VertexData();
    vertexData.positions = currentVertices;
    vertexData.indices = indices;
    vertexData.applyToMesh(cube);
}

const calculateDistanceBetweenOppositeFaces = (pickedFace, initialVertices) => {
    let pickedAxis = Math.floor(pickedFace/2);
    const oppositeVertices = [[0,7], [0,1], [0,3]];
    let sumOfSquare = 0;
    for(let j = 0; j < 3; j++){
        sumOfSquare += Math.pow(initialVertices[oppositeVertices[pickedAxis][0] * 3 + j] - initialVertices[oppositeVertices[pickedAxis][1] * 3 + j], 2) ;
    }
    return Math.sqrt(sumOfSquare);
}

const calculateActualExtrusionLength = (pickedFace,extrusionLength) =>{
    if(pickedFace === 2 ||  pickedFace === 3){
        return -1 * extrusionLength;
    }
    return extrusionLength;
}

const faceNoToVerticesMapping = [
    [0,1,2,3,10,11,12,13,16,19,20,23], // Face 0
    [4,5,6,7,8,9,14,15,17,18,21,22], //  Face 1
    [0,3,4,7,8,9,10,11,18,19,20,21], // Face 2
    [1,2,5,6,12,13,14,15,16,17,22,23], // Face 3
    [2,3,4,5,8,11,12,15,16,17,18,19], // Face 4
    [0,1,6,7,9,10,13,14,20,21,22,23] //Face 5
];

export {createCube, createButton, createTextBlock, calculateExtrusionDistance, computeNormalInCameraSpace, computeExtrusionLength, calculateDistanceBetweenOppositeFaces, performExtrusion, calculateActualExtrusionLength};