/* 
    must connect with all the other users, either direct or indirect, in order to merge content
    every user has a copy of user list, when a new user join the session, he must be recognized by all the existing user(from their user list)

    insertRemoteAtoms(startAtom, endAtom)


    user a and user b
    user a has higher priority than user b
    user a and user b sent out a message with a atom with the same id at the same time
    both messages are traveling and not arrived
    at a point in time, user a receives the message and user b receives the message


*/

export type Comparator = 1 | -1 | 0;

export type positionDigit = { index: number; siteId: number };

export interface Atom {
    data: string;
    pid: positionDigit[];
    clock: number;
}

export const init = 0;

const compareIds = (
    id1: positionDigit[],
    id2: positionDigit[],
    curIndex = 0
): Comparator => {
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
    const index1 = head1.index;
    const index2 = head2.index;
    if (siteId1 > siteId2) {
        return 1;
    } else if (siteId1 < siteId2) {
        return -1;
    } else {
        if (index1 > index2) {
            return 1;
        } else if (index1 < index2) {
            return -1;
        } else {
            curIndex++;
            return compareIds(id1, id2);
        }
    }
};

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
                return i;
            }
        } else {
            i = ~i;
        }
        this.splice(i, 0, target);
        return i;
    },
});
