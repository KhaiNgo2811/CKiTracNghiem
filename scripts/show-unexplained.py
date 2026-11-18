"""In ra các câu chưa có explanation: python scripts/show-unexplained.py <thư mục môn> <file.json> [trunc]"""
import json,sys,os
sub,f=sys.argv[1],sys.argv[2]; tr=int(sys.argv[3]) if len(sys.argv)>3 else 230
d=json.load(open(os.path.join('data',sub,f),encoding='utf-8-sig'))
ex_dir=os.path.join('scripts','explanations')
done={}
if os.path.isdir(ex_dir):
    for g in os.listdir(ex_dir): done.update(json.load(open(os.path.join(ex_dir,g),encoding='utf8')))
for t in d['topics']:
    for q in t['questions']:
        if q.get('explanation') or q['id'] in done: continue
        c=q['correctAnswer']
        print(q['id'].split('_',1)[1],'|',q['question'][:tr].replace('\n',' '),'||',c,'.',q['options'][c][:120],'||',' / '.join(v[:50] for k,v in q['options'].items() if k!=c))
