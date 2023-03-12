/* 
    must connect with all the other users, either direct or indirect, in order to merge content
    every user has a copy of user list, when a new user join the session, he must be recognized by all the existing user(from their user list)

    insertRemoteAtoms(startAtom, endAtom)


    user a and user b
    user a has higher priority than user b
    user a and user b sent out a message with a atom with the same id at the same time
    both messages are traveling and not arrived
    at a point in time, user a receives the message and user b receives the message

    [1,1][1,2][[2,3]
    [1,1][1,3]
    [2,1]

    [1,1][1,2][2,3]
    [1,1][1,2][2,3][1,1]
    [2,1]

    [1,1][1,2][2,3]
    [1,1][1,2][2,3][1,5]
    [1,1][1,2][2,4]

    [1,1][1,2][2,3]

    [1,1][1,2][2,3]
    [1,1][1,2][2,3][1,5]
    [1,1][1,2][3,3]

    [1,1]
    [1,1][1,4]
    [1,3]

    [1,1][2,1][3,1]
    [1,1][1,2]
    [1,1][2,1][3,3]

    [1,1]
    [1,2]
    [1,2][3,5]
    [2,3]
    [2,3][1,2]

    [1,1]
    [1,2]
    [1,2][3,5]
    [1,3]
    [1,3][1,2]
*/
class Node {
    children: any;
    data: any;
    constructor(data: any) {
        this.children = null;
        this.data = data;
    }
}
class Tree {
    root: Node;
    constructor() {
        this.root = new Node("root");
    }
}

export type Comparator = 1 | -1 | 0;

export type positionDigit = { position: number; siteId: number };

export interface Atom {
    data: string;
    pid: positionDigit[];
    clock: number;
}

const allocateId = (id1: number[], id2: number[]): number[] => {
    return [];
};

/* const generateId = (id1: positionDigit[], id2: positionDigit[], curIndex = 0, siteId: number) => {
    if(curIndex)
    const head1 = id1[curIndex];
    const head2 = id2[curIndex];
    const siteId1 = head1.siteId;
    const siteId2 = head2.siteId;
    const index1 = head1.index;
    const index2 = head2.index;
    if (index2 - index1 > 1) {
        if (siteId > siteId1) {
            if (siteId < siteId2) {
                //allocateId() from [id1 id2]
            } else {
                //allocateId() from [id1 id2)
            }
        } else {
            if (siteId < siteId2) {
                //allocateId() from (id1 id2]
            } else {
                //allocateId() from (id1 id2)
            }
        }
    } else if (index1 === index2) {
        if (siteId1 === siteId1) {
            generateId(id1, id2, ++curIndex, siteId);
        } else if (siteId1 < siteId2) {
            //allocateId() from (id1 infinity)
        } else {
            throw Error("invalid id order!(1)");
        }
    } else {
        throw Error("invalid id order!(2)");
    }
}; */

const generateId = (id1: positionDigit[], id2: positionDigit[], siteId: number) => {
    let head1;
    let head2;
    let siteId1;
    let siteId2;
    let index1;
    let index2;
    for (let i = 0; i < Math.min(id1.length, id2.length); i++) {
        head1 = id1[i];
        head2 = id2[i];
        siteId1 = head1.siteId;
        siteId2 = head2.siteId;
        index1 = head1.position;
        index2 = head2.position;
        if (index2 - index1 > 1) {
            if (siteId > siteId1) {
                if (siteId < siteId2) {
                    //return allocateId() from [id1 id2]
                } else {
                    //return allocateId() from [id1 id2)
                }
            } else {
                if (siteId < siteId2) {
                    //return allocateId() from (id1 id2]
                } else {
                    //return allocateId() from (id1 id2)
                }
            }
        } else if (index2 - index1 === 1) {
            if (siteId > siteId1) {
                if (siteId < siteId2) {
                    //return allocateId() from [id1 id2]
                } else {
                    //return allocateId() from [id1 id2)
                }
            } else {
                if (siteId < siteId2) {
                    //return allocateId() from (id1 id2]
                } else {
                    continue;
                }
            }
        } else if (index1 === index2) {
            /* if (siteId1 === siteId1) {
                continue;
            } else if (siteId1 < siteId2) {
                //return allocateId() from (id1 infinity)
            } else {
                throw Error("invalid id order!(1)");
            } */
            if (siteId1 > siteId2) {
                throw Error("invalid id order!(2)");
            }
            if (siteId < siteId2 && siteId > siteId1) {
                //return allocateId() from [id1, id2];
            } else {
                continue;
            }
        } else {
            throw Error("invalid id order!(3)");
        }
    }
    //allocateId(0)
};

export const init = 0;

export const compareIds = (id1: positionDigit[], id2: positionDigit[], curIndex = 0): Comparator => {
    if (curIndex >= id1.length && curIndex < id2.length) {
        return -1;
    } else if (curIndex < id1.length && curIndex >= id2.length) {
        return 1;
    } else if (curIndex >= id1.length && curIndex >= id2.length) {
        return 0;
    }
    const head1 = id1[curIndex];
    const head2 = id2[curIndex];
    const siteId1 = head1.siteId;
    const siteId2 = head2.siteId;
    const index1 = head1.position;
    const index2 = head2.position;
    if (index1 > index2) {
        return 1;
    } else if (index1 < index2) {
        return -1;
    } else {
        if (siteId1 > siteId2) {
            return 1;
        } else if (siteId1 < siteId2) {
            return -1;
        } else {
            return compareIds(id1, id2, ++curIndex);
        }
    }
};

export const compareAtoms = (atom1: Atom, atom2: Atom) => {
    return compareIds(atom1.pid, atom2.pid)
}

Object.defineProperty(Array.prototype, "binarySearch", {
    value: function (target: any, comparator: Function) {
        var l = 0,
            h = this.length - 1,
            m,
            comparison;
        comparator =
            comparator ||
            function (a: any, b: any) {
                return a < b ? -1 : a > b ? 1 : 0;
            };
        while (l <= h) {
            m = (l + h) >>> 1;
            comparison = comparator(this[m], target);
            if (comparison < 0) {
                l = m + 1;
            } else if (comparison > 0) {
                h = m - 1;
            } else {
                return m;
            }
        }
        return ~l; // when there is no duplication
    },
});

Object.defineProperty(Array.prototype, "binaryInsert", {
    value: function (target: any, duplicate: boolean, comparator: Function) {
        var i = this.binarySearch(target, comparator);
        if (i >= 0) {
            if (!duplicate) {
                console.log("duplicate", target,this)
                return;
                //throw Error("duplicate element")
            }
        } else {
            i = ~i;
        }
        this.splice(i, 0, target);
        return i;
    },
});
