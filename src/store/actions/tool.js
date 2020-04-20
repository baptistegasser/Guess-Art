export const setTool = (tool) => {
    return {
        type: 'SET_TOOL',
        tool: tool
    };
}

export const setWidth = (width) => {
    return {
        type: 'SET_WIDTH',
        width: width
    };
}

export const setColor = (color) => {
    return {
        type: 'SET_COLOR',
        color: color
    };
}
