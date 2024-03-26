@echo off

set b.x=3
set b.y=6

set a.x=16
set a.y=12

set "line=dx=b.x-a.x,dy=b.y-a.y,adx=(dx^(dx>>31))+((dx>>31)&1),ady=(dy^(dy>>31))+((dy>>31)&1),s=adx-((adx-ady)&((adx-ady)>>31))"
set /a "%line%"

set "max=a-((a-b)&((a-b)>>31))"

set a=5
set b=3
set /a "c=%max%"
echo;max^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%max%"
echo;max^(%a%, %b%^) = %c%

set "min=b+((a-b)&((a-b)>>31))"

set a=5
set b=3
set /a "c=%min%"
echo;min^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%min%"
echo;min^(%a%, %b%^) = %c%


set "abs=(n^(n>>31))+((n>>31)&1)"

set n=5
set /a "c=%abs%"
echo;abs^(%n%^) = %c%

set n=-5
set /a "c=%abs%"
echo;abs^(%n%^) = %c%

set "sign=1-(((n>>31)&1)<<1)"

set n=5
set /a "c=%sign%"
echo;sign^(%n%^) = %c%

set n=-5
set /a "c=%sign%"
echo;sign^(%n%^) = %c%

set "compare=(((b-a)>>31)&1)-(((a-b)>>31)&1)"

set a=5
set b=3
set /a "c=%compare%"
echo;compare^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%compare%"
echo;compare^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%compare%"
echo;compare^(%a%, %b%^) = %c%

set a=-3
set b=-3
set /a "c=%compare%"
echo;compare^(%a%, %b%^) = %c%


set "gtr=((b-a)>>31)&1"

set a=5
set b=3
set /a "c=%gtr%"
echo;gtr^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%gtr%"
echo;gtr^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%gtr%"
echo;gtr^(%a%, %b%^) = %c%


set "lss=((a-b)>>31)&1"

set a=5
set b=3
set /a "c=%lss%"
echo;lss^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%lss%"
echo;lss^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%lss%"
echo;lss^(%a%, %b%^) = %c%



set "geq=1-((a-b)>>31)&1"

set a=5
set b=3
set /a "c=%geq%"
echo;geq^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%geq%"
echo;geq^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%geq%"
echo;geq^(%a%, %b%^) = %c%



set "leq=1-((b-a)>>31)&1"

set a=5
set b=3
set /a "c=%leq%"
echo;leq^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%leq%"
echo;leq^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%leq%"
echo;leq^(%a%, %b%^) = %c%



set "equ=1-(((b-a)>>31)&1)-(((a-b)>>31)&1)"

set a=5
set b=3
set /a "c=%equ%"
echo;equ^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%equ%"
echo;equ^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%equ%"
echo;equ^(%a%, %b%^) = %c%



set "neq=(((b-a)>>31)&1)+(((a-b)>>31)&1)"

set a=5
set b=3
set /a "c=%neq%"
echo;neq^(%a%, %b%^) = %c%

set a=2
set b=9
set /a "c=%neq%"
echo;neq^(%a%, %b%^) = %c%

set a=15
set b=15
set /a "c=%neq%"
echo;neq^(%a%, %b%^) = %c%



set "isNonZero=((n|(~n+1))>>31)&1"

set n=5
set /a "c=%isNonZero%"
echo;isNonZero^(%n%^) = %c%

set n=0
set /a "c=%isNonZero%"
echo;isNonZero^(%n%^) = %c%

set n=-14
set /a "c=%isNonZero%"
echo;isNonZero^(%n%^) = %c%



set "isZero=1-((n|(~n+1))>>31)&1"

set n=5
set /a "c=%isZero%"
echo;isZero^(%n%^) = %c%

set n=0
set /a "c=%isZero%"
echo;isZero^(%n%^) = %c%

set n=-14
set /a "c=%isZero%"
echo;isZero^(%n%^) = %c%


set "logicalOr=(1-((a|(~a+1))>>31)&1)*b+a"

set a=5
set b=3
set /a "c=%logicalOr%"
echo;logicalOr^(%a%, %b%^) = %c%

set a=0
set b=9
set /a "c=%logicalOr%"
echo;logicalOr^(%a%, %b%^) = %c%

set a=15
set b=0
set /a "c=%logicalOr%"
echo;logicalOr^(%a%, %b%^) = %c%

set a=0
set b=0
set /a "c=%logicalOr%"
echo;logicalOr^(%a%, %b%^) = %c%


set "logicalAnd=((a|(~a+1))>>31)&1*(b-a)+a"

set a=5
set b=3
set /a "c=%logicalAnd%"
echo;logicalAnd^(%a%, %b%^) = %c%

set a=0
set b=9
set /a "c=%logicalAnd%"
echo;logicalAnd^(%a%, %b%^) = %c%

set a=15
set b=0
set /a "c=%logicalAnd%"
echo;logicalAnd^(%a%, %b%^) = %c%

set a=0
set b=0
set /a "c=%logicalAnd%"
echo;logicalAnd^(%a%, %b%^) = %c%

pause>nul&exit
