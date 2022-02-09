precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
varying vec2 vUv;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Env matcap
varying vec3 vViewPosition;
varying vec3 vViewNormal;

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

void main() {
	vUv = uv;

	///////////////////// NORMALS ///////////////////// 
	vec3 objectNormal = vec3( normal );
	vec3 transformedNormal = normalMatrix * objectNormal;
	vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vViewNormal = normalize(transformedNormal);

	///////////////////// POSITION /////////////////////
	vec4 worldPosition = modelMatrix * vec4(position, 1.0);
	vec4 mvPosition = viewMatrix * worldPosition;
	gl_Position = projectionMatrix * mvPosition;
	vViewPosition = -mvPosition.xyz;
}