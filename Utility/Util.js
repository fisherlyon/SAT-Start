export function setDiff(A, B) {
    return [... (new Set(A)).difference(new Set(B))];
}