import { positionDigit } from "./Tree";

const compareDigit = (digit1: positionDigit, digit2: positionDigit) => {
    const { position: position1, siteId: siteId1 } = digit1;
    const { position: position2, siteId: siteId2 } = digit2;
    if (position1 > position2) {
        return 1;
    } else if (position2 > position1) {
        return -1;
    } else if (position1 === position2) {
        if (siteId1 > siteId2) return 1;
        else if (siteId2 > siteId1) return -1;
        else return 0;
    }
};

const BASE = 100;
const BOUNDARY = 10;

const generatePosition = (position1: number, position2: number) => {
    const realBoundary = Math.min(BOUNDARY, position2 - position1);
    return position1 + Math.random() * realBoundary;
};

const allocateId = (id1: positionDigit[], id2: positionDigit[], siteId: number) => {
    let digit1;
    let digit2;
    let position1;
    let position2;
    let siteId1;
    let siteId2;
    let index = 0;
    let result: positionDigit[] = [];
    while (true) {
        if (id2[index] === undefined) {
            id2 = [...id2, { position: BASE, siteId: id2[id2.length - 1].siteId }];
        }
        if (id1[index] === undefined) {
            id1 = [...id1, { position: 0, siteId: id1[id1.length - 1].siteId }];
        }

        digit1 = id1[index];
        digit2 = id2[index];
        position1 = digit1.position;
        siteId1 = digit1.siteId;
        position2 = digit2.position;
        siteId2 = digit2.siteId;

        if (position2 - position1 > 0) {
            if (siteId > siteId1) {
                result = [...result, { position: generatePosition(position1, position2 - 1), siteId }];
                break;
            }
            if (siteId < siteId2) {
                result = [...result, { position: generatePosition(position1 + 1, position2), siteId }];
                break;
            }
            if (position2 - position1 > 1) {
                result = [...result, { position: generatePosition(position1 + 1, position2 - 1), siteId }];
                break;
            }
            id2 = id2.slice(0, index + 1);
            result.push(id1[index]);
        } else if (position1 === position2) {
            if (siteId2 > siteId1) {
                id2 = id2.slice(0, index + 1);
            }
            result.push(id1[index]);
        }
        index++;
    }
    //if the last digit is 0, then add one more non-zero position digit
    if (result[result.length - 1].position === 0)
        result = [...result, { position: generatePosition(1, BASE), siteId }];
    return result;
};

const generateId = (id1: positionDigit[], id2: positionDigit[], siteId: number) => {
    const length1 = id1.length;
    const length2 = id2.length;
    for (let i = 0; i < Math.min(length1, length2); i++) {
        const comparison = compareDigit(id1[i], id2[i]);
        if (comparison === 1) {
            throw Error("invalid position order!");
        } else if (comparison === -1) {
            return [...id1.slice(0, i), ...allocateId(id1.slice(i), id2.slice(i), siteId)];
            // id1.slice(i), id2.slice(i)
        } else {
            continue;
        }
    }
    if (length1 > length2) {
        throw Error("invalid position order");
    } else if (length2 > length1) {
        return [...id1, ...allocateId([], id2.slice(length1), siteId)];
        //undefined, id2.slice(length1)
    } else if (length1 === length2) {
        //undefined, undefined
        return [...id1, ...allocateId([], [], siteId)];
    }
};
