def find_shortest_path(graph, start, end, path = None):
    if path is None:
        path = []
        
    path = path + [start]
    
    if start == end:
        return [path]
    
    if start not in graph:
        return []
    
    paths = []
    for node in graph[start]:
        if node not in path:
            new_paths = find_shortest_path(graph, node, end, path)
            paths.extend(new_paths)
            
    return paths