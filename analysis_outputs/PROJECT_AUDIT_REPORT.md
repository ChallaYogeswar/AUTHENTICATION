# Project Audit Report

Generated: 2026-02-19 04:42:24Z (UTC)

## User requirements / expected behaviour (FILL THIS IN)

I wanted to make authentications for different project purposes and I wanted to make it in a way that I can easily add new authentication methods in the future. I also wanted to make it more secure and more scalable.

-----
## 1) Quick environment checks

Project root: C:\Users\chall\Downloads\PROJECTS\AUTH
User: chall | Machine: ETERNALPOWER
PowerShell version: 5.1.26100.7705
Path contains: c:\Users\chall\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\debugCommand;c:\Users\chall\AppData\Roaming\Code\User\globalStorage\github.copilot-chat\copilotCli;C:\Users\chall\Downloads\flutter_windows_3.24.4-stable\flutter\bin;C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot\bin;C:\Program Files\Python312\Scripts\
analyze_project.ps1
PROJECT_AUDIT_REPORT.md
ENTERPRISE MODEL-2
	.gitignore
	docker-compose.yml
	backend
		.env
		.env.test
		Dockerfile
		e2e-test-results.txt
		package.json
		package-lock.json
		tsconfig.json
		coverage
			clover.xml
			coverage-final.json
			lcov.info
			lcov-report
				base.css
				block-navigation.js
				favicon.png
				index.html
				prettify.css
				prettify.js
				sort-arrow-sprite.png
				sorter.js
				src
		dist
			app.module.d.ts
			app.module.js
			app.module.js.map
			main.d.ts
			main.js
			main.js.map
			tsconfig.tsbuildinfo
			common
				decorators
			modules
				audit
				auth
				mail
				sessions
				users
			src
				modules
			test
				app.e2e-spec.d.ts
				app.e2e-spec.js
				app.e2e-spec.js.map
				auth.e2e-spec.d.ts
				auth.e2e-spec.js
				auth.e2e-spec.js.map
		src
			app.module.ts
			main.ts
			common
				decorators
			modules
				audit
				auth
				mail
				sessions
				users
		test
			app.e2e-spec.ts
			auth.e2e-spec.ts
			jest-e2e.json
	database
		schema.sql
	docs
		DEPLOYMENT.md
		implementation summary 10-02-2026.md
		model_2_implementation_plan.md
		REVIEW_ANALYSIS_12-02-2026.md
		TESTING.md
	frontend
		Dockerfile
		next.config.js
		next-env.d.ts
		package.json
		package-lock.json
		tailwind.config.js
		tsconfig.json
		.next
			app-build-manifest.json
			app-path-routes-manifest.json
			BUILD_ID
			build-manifest.json
			export-marker.json
			images-manifest.json
			next-minimal-server.js.nft.json
			next-server.js.nft.json
			package.json
			prerender-manifest.json
			react-loadable-manifest.json
			required-server-files.json
			routes-manifest.json
			trace
			cache
				.tsbuildinfo
				swc
				webpack
			server
				app-paths-manifest.json
				font-manifest.json
				functions-config-manifest.json
				interception-route-rewrite-manifest.js
				middleware-build-manifest.js
				middleware-manifest.json
				middleware-react-loadable-manifest.js
				next-font-manifest.js
				next-font-manifest.json
				pages-manifest.json
				server-reference-manifest.js
				server-reference-manifest.json
				webpack-runtime.js
				app
				chunks
				pages
			static
				chunks
				css
				media
				pRz-ed1-GZsUlboik5mCd
			types
				package.json
				app
		src
			app
				globals.css
				layout.tsx
				login
	nginx
		nginx.conf
FOUNDATION MODEL-1.5
	model_1.5_implementation_plan.md
	TODO.md
	backend
		.env.example
		Dockerfile
		package.json
		package-lock.json
		tsconfig.json
		database
			schema.sql
		src
			app.module.ts
			main.ts
			common
				decorators
			modules
				audit
				auth
				mail
				sessions
				users
			utils
				password.ts
	database
		schema.sql
	frontend
		Dockerfile
		index.html
		package.json
		vite.config.js
		vite.config.ts
		src
			App.jsx
			index.css
			main.jsx
			components
				ProtectedRoute.jsx
			pages
				Dashboard.jsx
				Login.jsx
				Register.jsx
			services
				api.js
			store
				authStore.js
	nginx
		nginx.conf
Plans
	model_1.5_implementation_plan.md
	model_1_implementation_plan.md
	model_2_implementation_plan.md
	Models.md
SPRINT MODEL-1
	.env
	model_1_implementation_plan.md
	package.json
	package-lock.json
	server.js
	TODO.md
	backend
	frontend
		index.html
		package.json
		vite.config.js
		src
			App.jsx
			index.css
			main.jsx
			components
				auth
				common
			pages
				Login.jsx
				Register.jsx
			services
				api.js
			store
				authStore.js
	src
		middleware
			auth.js
		models
			database.js
		routes
			auth.js
			profile.js
			sessions.js
		services
			emailService.js
		utils
			logger.js
			password.js

## 2) Detected languages & important files


## 3) Dependency manifests (top-level)

## 4) Quick grep for TODO/FIXME and likely secrets


## 5) Simple secret pattern scan


## 6) Language-specific static analysis and tests


### Python analysis

#### flake8 (sample)

.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:19:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:24:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:37:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:43:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:46:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:49:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:52:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:59:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:67:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:77:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:81:9: E722 do not use bare 'except'
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:86:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:101:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\flatted\python\flatted.py:117:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\easy_xml.py:159:39: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\analyzer.py:145:40: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\analyzer.py:185:49: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\cmake.py:78:25: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\make.py:2071:56: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:279:12: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:291:12: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:313:29: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:1384:12: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:1428:16: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:1827:12: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:1849:8: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:1851:8: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\msvs.py:3443:8: E721 do not compare types, for exact checks use `is` / `is not`, for instance checks use `isinstance()`
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\generator\ninja.py:69:31: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\input.py:1432:31: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\msvs_emulation.py:1173:36: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\ninja_syntax.py:154:34: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\xcode_emulation.py:890:38: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\xcode_emulation.py:895:63: E203 whitespace before ':'
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:19:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:24:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:37:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:43:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:46:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:49:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:52:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:59:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:67:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:77:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:81:9: E722 do not use bare 'except'
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:86:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:101:1: E302 expected 2 blank lines, found 1
.\ENTERPRISE MODEL-2\frontend\node_modules\flatted\python\flatted.py:117:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:19:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:24:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:37:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:43:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:46:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:49:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:52:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:59:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:67:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:77:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:81:9: E722 do not use bare 'except'
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:86:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:101:1: E302 expected 2 blank lines, found 1
.\FOUNDATION MODEL-1.5\backend\node_modules\flatted\python\flatted.py:117:1: E302 expected 2 blank lines, found 1
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_code\code.py:673:49: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_code\code.py:964:52: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_code\source.py:65:51: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_code\source.py:66:59: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_io\pprint.py:662:24: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_io\saferepr.py:32:44: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_py\path.py:445:47: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_py\path.py:447:43: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\_py\path.py:1294:54: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\assertion\util.py:390:36: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\assertion\util.py:391:38: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\assertion\util.py:602:34: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\compat.py:45:1: E305 expected 2 blank lines after class or function definition, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\compat.py:171:60: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\config\findpaths.py:192:64: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\doctest.py:359:57: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\doctest.py:655:85: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\junitxml.py:372:9: F811 redefinition of unused 'record_func' from line 365
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\main.py:413:121: E501 line too long (125 > 120 characters)
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\mark\expression.py:104:34: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\mark\expression.py:301:83: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\outcomes.py:286:121: E501 line too long (137 > 120 characters)
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\pytester.py:1629:40: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\python.py:337:1: E305 expected 2 blank lines after class or function definition, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\python_api.py:234:26: E201 whitespace after '{'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\raises.py:1051:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\raises.py:1097:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\raises.py:1259:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\runner.py:518:53: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\terminal.py:945:52: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\terminal.py:1073:80: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\terminal.py:1323:48: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\terminal.py:1664:44: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_pytest\terminal.py:1671:45: E203 whitespace before ':'
.\analysis_outputs\.analysis_venv\Lib\site-packages\_yaml\__init__.py:16:5: F403 'from yaml._yaml import *' used; unable to detect undefined names
.\analysis_outputs\.analysis_venv\Lib\site-packages\_yaml\__init__.py:16:5: F401 'yaml._yaml.*' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:2:1: F401 '.initialise.init' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:2:1: F401 '.initialise.deinit' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:2:1: F401 '.initialise.reinit' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:2:1: F401 '.initialise.colorama_text' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:2:1: F401 '.initialise.just_fix_windows_console' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:3:1: F401 '.ansi.Fore' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:3:1: F401 '.ansi.Back' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:3:1: F401 '.ansi.Style' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:3:1: F401 '.ansi.Cursor' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:4:1: F401 '.ansitowin32.AnsiToWin32' imported but unused
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\__init__.py:7:1: W391 blank line at end of file
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:15:1: E302 expected 2 blank lines, found 1
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:18:1: E302 expected 2 blank lines, found 1
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:21:1: E302 expected 2 blank lines, found 1
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:39:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:41:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:43:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:45:5: E301 expected 1 blank line, found 0
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:50:10: E221 multiple spaces before operator
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:51:8: E221 multiple spaces before operator
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:52:10: E221 multiple spaces before operator
.\analysis_outputs\.analysis_venv\Lib\site-packages\colorama\ansi.py:53:11: E221 multiple spaces before operator

#### bandit (sample)

Run started:2026-02-19 04:51:36.059451+00:00

Test results:
>> Issue: [B404:blacklist] Consider possible security implications associated with the subprocess module.
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/blacklists/blacklist_imports.html#b404-import-subprocess
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\gyp_main.py:9:0
8	import sys
9	import subprocess
10	

--------------------------------------------------
>> Issue: [B607:start_process_with_partial_path] Starting a process with a partial executable path
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b607_start_process_with_partial_path.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\gyp_main.py:15:14
14	    try:
15	        out = subprocess.Popen(
16	            "uname", stdout=subprocess.PIPE, stderr=subprocess.STDOUT
17	        )
18	        stdout, _ = out.communicate()

--------------------------------------------------
>> Issue: [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b603_subprocess_without_shell_equals_true.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\gyp_main.py:15:14
14	    try:
15	        out = subprocess.Popen(
16	            "uname", stdout=subprocess.PIPE, stderr=subprocess.STDOUT
17	        )
18	        stdout, _ = out.communicate()

--------------------------------------------------
>> Issue: [B607:start_process_with_partial_path] Starting a process with a partial executable path
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b607_start_process_with_partial_path.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\gyp_main.py:28:14
27	            return path
28	        out = subprocess.Popen(
29	            ["cygpath", "-u", path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT
30	        )
31	        stdout, _ = out.communicate()

--------------------------------------------------
>> Issue: [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b603_subprocess_without_shell_equals_true.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\gyp_main.py:28:14
27	            return path
28	        out = subprocess.Popen(
29	            ["cygpath", "-u", path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT
30	        )
31	        stdout, _ = out.communicate()

--------------------------------------------------
>> Issue: [B324:hashlib] Use of weak MD5 hash for security. Consider usedforsecurity=False
   Severity: High   Confidence: High
   CWE: CWE-327 (https://cwe.mitre.org/data/definitions/327.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b324_hashlib.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSNew.py:48:8
47	    # Calculate a MD5 signature for the seed and name.
48	    d = hashlib.md5((str(seed) + str(name)).encode("utf-8")).hexdigest().upper()
49	    # Convert most of the signature to GUID form (discard the rest)

--------------------------------------------------
>> Issue: [B404:blacklist] Consider possible security implications associated with the subprocess module.
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/blacklists/blacklist_imports.html#b404-import-subprocess
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSVersion.py:10:0
9	import re
10	import subprocess
11	import sys

--------------------------------------------------
>> Issue: [B101:assert_used] Use of assert detected. The enclosed code will be removed when compiling to optimised byte code.
   Severity: Low   Confidence: High
   CWE: CWE-703 (https://cwe.mitre.org/data/definitions/703.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b101_assert_used.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSVersion.py:90:8
89	    environment."""
90	        assert target_arch in ("x86", "x64"), "target_arch not supported"
91	        # If WindowsSDKDir is set and SetEnv.Cmd exists then we are using the

--------------------------------------------------
>> Issue: [B603:subprocess_without_shell_equals_true] subprocess call - check for execution of untrusted input.
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b603_subprocess_without_shell_equals_true.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSVersion.py:174:8
173	        cmd.extend(["/v", value])
174	    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
175	    # Obtain the stdout from reg.exe, reading to the end so p.returncode is valid

--------------------------------------------------
>> Issue: [B101:assert_used] Use of assert detected. The enclosed code will be removed when compiling to optimised byte code.
   Severity: Low   Confidence: High
   CWE: CWE-703 (https://cwe.mitre.org/data/definitions/703.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b101_assert_used.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSVersion.py:225:8
224	        root, subkey = key.split("\\", 1)
225	        assert root == "HKLM"  # Only need HKLM for now.
226	        with OpenKey(HKEY_LOCAL_MACHINE, subkey) as hkey:

--------------------------------------------------
>> Issue: [B607:start_process_with_partial_path] Starting a process with a partial executable path
   Severity: Low   Confidence: High
   CWE: CWE-78 (https://cwe.mitre.org/data/definitions/78.html)
   More Info: https://bandit.readthedocs.io/en/1.9.3/plugins/b607_start_process_with_partial_path.html
   Location: .\ENTERPRISE MODEL-2\backend\node_modules\node-gyp\gyp\pylib\gyp\MSVSVersion.py:430:12
429	    if sys.platform == "cygwin":
430	        p = subprocess.Popen(["cygpath", path], stdout=subprocess.PIPE)
431	        path = p.communicate()[0].decode("utf-8").strip()


no tests ran in 0.17s
mypy.exe : There are no .py[i] files in directory '.'
At C:\Users\chall\Downloads\PROJECTS\AUTH\analyze_project.ps1:170 char:9
+         & mypy . --ignore-missing-imports > (Join-Path $OutDir "mypy. ...
+         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (There are no .p...n directory '.':String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 

## 7) Attempt short smoke runs of likely entrypoints (20s timeout each)


## 8) Findings summary & critical issues

1. If secrets found, rotate them and add secrets to a secret manager. Add .gitignore rules.
2. Fix critical security findings found by bandit/eslint first.
3. Address failing tests; add CI to run lint + tests on PRs (GitHub Actions).
4. Add README with run instructions and expected behavior (python/node/gradle start commands).
