#!/usr/bin/env python3
"""Attribute upstream authors in package manifests.

For each third-party-origin package, set `author` to the upstream author and
point `repository`/`homepage` at the upstream project where the manifest
currently lacks that link. Self-developed packages are untouched.

Usage: attribute-upstream.py [--apply]
  default is dry-run: prints the planned changes per package.
"""
import json
import os
import sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'packages')
BASE = os.path.normpath(BASE)

# dir -> (author, upstream repo url or None to keep current, homepage or None to keep current)
ATTRIBUTION = {
    'aurabot': ('accomplish07zrh-eng', None, None),
    'balance': ('MeteorNOX', None, None),
    'better-sidebar': ('omdsh-dev', None, None),
    'bili-humanism': ('InariNGT-Ofiicial', None, None),
    'bili-live': ('rentaoyan0628-collab', 'https://github.com/rentaoyan0628-collab/dsh-bili-live', 'https://github.com/rentaoyan0628-collab/dsh-bili-live'),
    'bili-scroll': ('c1overzz', None, None),
    'bili-whale': ('Alterssss', 'https://github.com/Alterssss/dsh-bili-whale', 'https://github.com/Alterssss/dsh-bili-whale'),
    'bot': ('MJ-CJM', 'https://github.com/MJ-CJM/DSH-Bot', 'https://github.com/MJ-CJM/DSH-Bot'),
    'bridge': ('wenbin-wb', None, None),
    'browser': (None, 'https://github.com/yuxianglin/dsh-bridge-browser', 'https://github.com/yuxianglin/dsh-bridge-browser'),
    'damage-pulse': ('wssfk12138', None, None),
    'distill': ('loserfox', 'https://github.com/loserfox/distill', 'https://github.com/loserfox/distill'),
    'drawio': ('jean3690', None, None),
    'fish-memory': ('Yuuyuko-uu', None, None),
    'im': (None, 'https://github.com/xmanrui/dsh-im', 'https://github.com/xmanrui/dsh-im'),
    'knowledge-studio': ('eduwork', None, None),
    'meme': ('yyh-001', None, None),
    'notes': ('zhaoolee', None, None),
    'oh-story': ('zenstory-ai', 'https://github.com/zenstory-ai/oh-story-dsh', 'https://github.com/zenstory-ai/oh-story-dsh'),
    'open-sea': ('d-dev0101', None, None),
    'ops': ('T-Auto', None, None),
    'persona': ('Scorp1o117', 'https://github.com/Scorp1o117/dsh-soul-md', 'https://github.com/Scorp1o117/dsh-soul-md'),
    'proactive': ('john-walks-slow', 'https://github.com/john-walks-slow/dsh-proactive', 'https://github.com/john-walks-slow/dsh-proactive'),
    'qqbot': ('tencent-connect', 'https://github.com/tencent-connect/dsh-qqbot', 'https://github.com/tencent-connect/dsh-qqbot'),
    'qq-console': ('zjw0011', 'https://github.com/zjw0011/dsh-qq-console', 'https://github.com/zjw0011/dsh-qq-console'),
    'rewind': ('SiriLee', None, None),
    'skin-market': ('kingOfSoySauce', None, None),
    'speak-up': ('Yuuyuko-uu', None, None),
    'tavern': ('KamishiroRei', 'https://github.com/KamishiroRei/dsh-sillytavern', 'https://github.com/KamishiroRei/dsh-sillytavern'),
    'task-board': ('linxin666', None, None),
    'skill-explorer': ('linxin666', None, None),
    'skillhub': ('astron-team', None, None),
    'team-conductor': ('dsh-team-conductor contributors', None, None),
    'voice': (None, 'https://github.com/STARDUSTLC666/dsh-voice', 'https://github.com/STARDUSTLC666/dsh-voice'),
    'voice-mode': ('qishuilalala', 'https://github.com/qishuilalala/dsh-voice-mode', 'https://github.com/qishuilalala/dsh-voice-mode'),
    'visualize': ('Nagi-ovo', None, None),
    'whale-musume': ('Sutera-Diffusus', None, None),
    'skill-humanizer-zh': ('op7418', 'https://github.com/op7418/dsh-guizang-design', 'https://github.com/op7418/dsh-guizang-design'),
    'skill-social-card': ('op7418', 'https://github.com/op7418/dsh-guizang-design', 'https://github.com/op7418/dsh-guizang-design'),
}


def main():
    apply = '--apply' in sys.argv
    changed = 0
    for dirname, (author, repo_url, homepage) in sorted(ATTRIBUTION.items()):
        path = os.path.join(BASE, dirname, 'package.json')
        if not os.path.isfile(path):
            print(f'{dirname}: MISSING package.json')
            continue
        with open(path, encoding='utf-8') as f:
            m = json.load(f)
        edits = []
        if author and m.get('author') != author:
            edits.append(f"author {m.get('author')!r} -> {author!r}")
            m['author'] = author
        if repo_url:
            cur = m.get('repository')
            cur_url = cur.get('url') if isinstance(cur, dict) else cur
            if cur_url != repo_url:
                edits.append(f"repository {cur_url!r} -> {repo_url!r}")
                m['repository'] = {'type': 'git', 'url': repo_url}
        if homepage:
            cur_hp = m.get('homepage')
            # Keep a homepage that already names this package's own page in the mino repo;
            # replace only missing ones or links that land elsewhere (repo root, wrong dir).
            own_page = f'/tree/main/packages/{dirname}' in (cur_hp or '')
            if cur_hp != homepage and not own_page:
                edits.append(f"homepage {cur_hp!r} -> {homepage!r}")
                m['homepage'] = homepage
        if not edits:
            continue
        changed += 1
        print(f"{dirname} ({m.get('name')}):")
        for e in edits:
            print('  ' + e)
        if apply:
            with open(path, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(m, f, ensure_ascii=False, indent=2)
                f.write('\n')
    print(f'\n{"applied" if apply else "dry-run"}: {changed} package(s) changed')


if __name__ == '__main__':
    main()
