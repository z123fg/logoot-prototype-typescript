import { generateId } from "./generateId";
export const mockIds = [
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
    ]

];
export const prettyPrintId = (id) => {
    let string = "";
    id.forEach(digit=>{
        string += JSON.stringify(Object.values(digit))
    });
    console.log("input",string)
}

describe("generateId", () => {
    test("generateId should work", () => {
        mockIds.forEach((mock)=>{
            const output = generateId(...mock);
            mock.slice(0,2).forEach(id=>prettyPrintId(id));
           prettyPrintId(output)
            console.log("--------------")
        })
    });
});
