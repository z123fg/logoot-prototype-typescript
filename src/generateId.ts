import { compareIds } from "./Tree";

type positionDigit = { position: number; siteId: number };

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
    return position1 + Math.round(Math.random() * realBoundary);
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
        //console.log("id1", id1, index);
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

export const generateId = (id1: positionDigit[], id2: positionDigit[], siteId: number): positionDigit[] => {
    const length1 = id1.length;
    const length2 = id2.length;
    for (let i = 0; i < Math.min(length1, length2); i++) {
        const comparison = compareDigit(id1[i], id2[i]);
        if (comparison === 1) {
            console.log("invalid position order", id1, id2, siteId);
            throw Error("invalid position order!");
        } else if (comparison === -1) {
            const newId = [...id1.slice(0, i), ...allocateId(id1.slice(i), id2.slice(i), siteId)];
            console.log(
                "allocateId",
                id1,
                id2,
                newId.map((digit) => digit.position),
                siteId
            );
            return newId;
            // id1.slice(i), id2.slice(i)
        } else {
            continue;
        }
    }
    if (length1 > length2) {
        console.log("invalid position order", id1, id2, siteId);
        throw Error("invalid position order");
    } else if (length2 > length1) {
        const newId = [
            ...id1,
            ...allocateId([{ position: 0, siteId: id1[length1 - 1].siteId }], id2.slice(length1), siteId),
        ];
        console.log(
            "allocateId",
            id1,
            id2,
            newId.map((digit) => digit.position),
            siteId
        );
        return newId;
        //undefined, id2.slice(length1)
    } else {
        //undefined, undefined
        /*  return [...id1, ...allocateId([{ position: 0, siteId: id1[length1 - 1].siteId }], [{ position: BASE, siteId: id2[length2 - 1].siteId }], siteId)]; */
        throw Error("2 ids are the same");
    }
};

export const mockIds: [positionDigit[], positionDigit[], number][] = [
    [
        [{ position: 1, siteId: 1 }],
        [
            { position: 1, siteId: 1 },
            { position: 3, siteId: 4 },
        ],
        6,
    ],

    [
        [{ position: 1, siteId: 1 }],
        [
            { position: 1, siteId: 1 },
            { position: 1, siteId: 1 },
        ],
        6,
    ],
    [[{ position: 1, siteId: 1 }], [{ position: 1, siteId: 5 }], 6],
    [[{ position: 1, siteId: 1 }], [{ position: 2, siteId: 7 }], 6],
    [[{ position: 1, siteId: 8 }], [{ position: 2, siteId: 7 }], 6],
    [[{ position: 1, siteId: 8 }], [{ position: 2, siteId: 4 }], 6],
    [
        [
            { position: 1, siteId: 8 },
            { position: 1, siteId: 8 },
        ],
        [{ position: 2, siteId: 4 }],
        6,
    ],
    [
        [
            { position: 1, siteId: 8 },
            { position: 1, siteId: 8 },
        ],
        [{ position: 1, siteId: 9 }],
        6,
    ],
];
export const prettyPrintId = (id: positionDigit[]) => {
    let string = "";
    id.forEach((digit) => {
        string += JSON.stringify(Object.values(digit));
    });
    return string;
};

/* mockIds.forEach((mock) => {
    let output: any = [];
    const newId = generateId(...mock);
    mock.slice(0, 2).forEach((id) => output.push(prettyPrintId(id as positionDigit[])));
    const comparison = compareIds(newId,mock[0]) === 1 && compareIds(mock[1],newId) === 1 
    output.splice(1, 0, prettyPrintId(newId));

    output.forEach((ele: any) => {
        console.log(ele);
    });
    console.log(
        "comparison",comparison
    )
    console.log("--------------");
});
 */
