interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface DetectedObject {
    name: string;
    coords: BoundingBox;
}

export interface DetectionResponse {
    objs: DetectedObject[];
    materials?: string[];
    res: string;
}

export const DetectionSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "DetectionResponse",
    "type": "object",
    "required": [
        "objs",
        "res"
    ],
    "properties": {
        "objs": {
            "type": "array",
            "description": "Array of detected objects in the image",
            "items": {
                "type": "object",
                "required": [
                    "name",
                    "coords"
                ],
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Label of the detected object (e.g. ssd, food wrapper, clothing)"
                    },
                    "coords": {
                        "type": "object",
                        "description": "Bounding box coordinates of the detected object in decimal percentages (50%->0.5)",
                        "required": [
                            "x1",
                            "y1",
                            "x2",
                            "y2"
                        ],
                        "properties": {
                            "x1": {
                                "type": "number",
                                "description": "Left edge x-coordinate"
                            },
                            "y1": {
                                "type": "number",
                                "description": "Top edge y-coordinate"
                            },
                            "x2": {
                                "type": "number",
                                "description": "Right edge x-coordinate"
                            },
                            "y2": {
                                "type": "number",
                                "description": "Bottom edge y-coordinate"
                            }
                        },
                        "additionalProperties": false
                    }
                },
                "additionalProperties": false
            }
        },
        "materials": {
            "type": "array",
            "description": "Array of precious materials in objects in the image",
            "items": {
                "type": "string"
            }
        },
        "res": {
            "type": "string",
            "description": "The response to the user's question"
        }
    },
    "additionalProperties": false
}