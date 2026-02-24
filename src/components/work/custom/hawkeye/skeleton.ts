
export const BONE_CONNECTIONS: [string, string][] = [
    // Torso
    ['midHip', 'neck'],
    ['midHip', 'lHip'],
    ['midHip', 'rHip'],
    ['neck', 'nose'],

    // Left Arm
    ['neck', 'lShoulder'],
    ['lShoulder', 'lElbow'],
    ['lElbow', 'lWrist'],
    ['lWrist', 'lThumb'],
    ['lWrist', 'lPinky'],

    // Right Arm
    ['neck', 'rShoulder'],
    ['rShoulder', 'rElbow'],
    ['rElbow', 'rWrist'],
    ['rWrist', 'rThumb'],
    ['rWrist', 'rPinky'],

    // Left Leg
    ['lHip', 'lKnee'],
    ['lKnee', 'lAnkle'],
    ['lAnkle', 'lHeel'],
    ['lAnkle', 'lBigToe'],
    ['lAnkle', 'lSmallToe'],

    // Right Leg
    ['rHip', 'rKnee'],
    ['rKnee', 'rAnkle'],
    ['rAnkle', 'rHeel'],
    ['rAnkle', 'rBigToe'],
    ['rAnkle', 'rSmallToe'],

    // Face (optional extra details)
    ['lEar', 'lEye'],
    ['lEye', 'nose'],
    ['nose', 'rEye'],
    ['rEye', 'rEar']
];

export const TEAM_COLORS = {
    home: '#EAB308', // Yellow (Lakers/Warriors vibe)
    away: '#3B82F6', // Blue
    ball: '#F97316'  // Orange
};
