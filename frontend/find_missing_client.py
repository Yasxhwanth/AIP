import os

app_dir = r'c:\Users\YASHWANTH\Projects\AIP\frontend\src\app'
missing_use_client = []

hooks = [
    'useState', 'useEffect', 'useContext', 'useReducer', 'useRef', 
    'useMemo', 'useCallback', 'useLayoutEffect', 'useImperativeHandle', 
    'useDebugValue', 'useTransition', 'useDeferredValue', 'useId', 
    'useSyncExternalStore', 'useInsertionEffect', 'useOptimistic', 
    'useFormStatus', 'useFormState', 'useActionState', 'useRouter', 
    'usePathname', 'useSearchParams', 'useWorkspaceStore', 'useRuntimeStore',
    'useBuilderStore', 'useIntelligenceStore'
]

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                has_hooks = any(hook in content for hook in hooks)
                
                if has_hooks and '"use client"' not in content and "'use client'" not in content:
                    missing_use_client.append(path)
            except:
                pass

for p in missing_use_client:
    print(p)
