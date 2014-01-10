# Nermal examples!
Nermal is pretty self-explanatory, but there were some example Unix applications
which I wanted to write and release publicly anyway. These are written for Node
but are *not* included in an `npm install`, because they have additional
dependencies.

Installation therefore requires downloading these scripts manually and
installing them and their dependencies; and `npm` can sometimes be a little
frustrating with dependency management. We will assume that `npm` has created an
executable directory called `~/node_modules/.bin` which is in your `$PATH`; if
it is not, see the last section of this document.

These are offered under the same license as nermal, the 2-clause BSD license.

# ncrypt
The utility `ncrypt` allows you to interactively encrypt or decrypt nermal files
on your computer. It will decrypt any nermal file with `unbox` and can create
special nermal boxes with `box`. It usually preserves the original file and
saves the encrypted version with a `.nermal` extension, but of course you can
save however you want.

Example usage:

    drostie@signy:/tmp$ echo "Woo, secret text." >> example
    drostie@signy:/tmp$ ncrypt box example
    Password:
    Confirm:
    File recorded successfully.
    drostie@signy:/tmp$ ls example*
    example  example.nermal
    drostie@signy:/tmp$ shred -u example
    drostie@signy:/tmp$ cat example.nermal
    ncrypt 1.1.0/nermal 1.1.2
    aavijNfFeV9Nthh80ujZBk7Seo+i7QlWONM1Uxz7
    sGzxJE3xV+Izw56jzk7EzQ==
    on24LrnB+pADcgmS8tlHum7JUjOs6Y2VtyJhMSX/1hKFn6F1oqCyBOVRUr8h+6q7avzN0gbz4HFdd4Ub
    N5d3wpaSA3kjqNsyZaE1TQv4UiQA1gJVU4tTN7jVOv30Bup1vxUqE/5UzivvRKMv+AyCJT84kkoKIWul
    OCU1RQMlX3lxkWnzQDo4vYp0cwznh9nhRIs14AtpDg4VYajrOCP73/rlzBsvv81XBhUYqHj06x9dNV7q
    xA3CUN5qew8XqIIhBB0tlFXfATNwVDvM/8NM5HTJz9j8Pkkc73kltTQT4sRpiUDNf4zEZsYXQpwVfVxp
    +bRQ2DHIUQEyi/AivZcCnBNH4jAR0hw/+1hUd4J7Io+IKioLo8nU82r2uoKb4kgWYBydqklOpstKr9Lo
    K55RPpHEEPhR0WA5Wgcwd5CHGRd5nCuR88hPVRjbK5EEqHevLjxZ9/DoZtuZlXvoTaI84Gh+ZpICW0JN
    uNUwYgIgcKkcHNn9dT+7u4IMmIhDNEN3abvvROXoZAoUAmyIVSETBlkZc/yJdXlI9yJIsQJM8UoivRoZ
    TzpE25g5dqe4PxRmUtjq+MuLM9P/CClnJH6EvbIY3fkoA8zbAfa754y/f/TQvfH7iK3BpYrPTnfnaJnu
    OYEt9gyFTjGxtH8WZn631GucOYLPA9rpRpKlGCrrBYNMFfD1cNBjnChGQ+P/gulh+y+zoOHJVuFCrMzI
    CaWFSLf7abzhIa7M2dNvsNmXeWWKSjEojrRViBjMVSTQ2K7lXkRxyWbAEUFSu513yA==
    drostie@signy:/tmp$ ncrypt unbox -p 'Pogo!' example.nermal -
    Woo, secret text.

Notice that sources and destinations of `-` stand for stdin and stdout, and
there are some useful flags like `-b`, which eliminates the Base64 waste (but
not the 0-2048 bytes of random padding which nermal uses to obscure the real
length of the string). The command is documented under `ncrypt --help`. 

To install the latest version with wget:

    npm install bencode commander nermal promise promptly
    wget -O ~/node_modules/.bin/ncrypt https://raw.github.com/drostie/nermal/master/examples/ncrypt
    chmod 744 ~/node_modules/.bin/ncrypt

# tagaloop
I wrote `tagaloop` to manage my passwords file. It is substantially different
from `ncrypt` and rather than having a Unix command-line interface, it runs a
read-eval-print loop or REPL -- hence the 'loop' in the name. It manages a file
of tagged strings interactively, allowing you to grep across the tags with
JavaScript regular expressions. Here's some example usage:

    drostie@signy:/tmp$ tagaloop example
    File 'example' doesn't exist. Create a new one? y
    Select a new password:
    Confirm it:
    This file will be saved when you use the `save` command.

    tagaloop 2.0.0
    Type `help` for a list of commands.
    > save
    Written successfully to `example`.
    > help
    Registered commands:
        # - add alter exit help list relabel remove save show
    Type `help [command]` for more info about a particular command.
    > add blue
    String: Hello, world!
    Added with id: t5WV9rS2
    > add blue
    String: 1
    Added with id: k.1ENkl2
    > list
    t5WV9rS2 | blue | Hello, world!
    k.1ENkl2 | blue | 1
    > relabel t5WV9rS2 black
    > add red
    String: 2
    Added with id: Bubq3fpH
    > add green
    String: 3
    Added with id: Q.F10YwH
    > add able
    String: 4
    Added with id: TIzKZyk2
    > list re
    Bubq3fpH | red | 2
    Q.F10YwH | green | 3
    > list ^bl
    k.1ENkl2 | blue | 1
    t5WV9rS2 | black | Hello, world!
    > exit
    Potentially unsaved changes.
    Are you sure you want to exit? n
    > save exit
    Written successfully to `example`.
    drostie@signy:/tmp$ cat example
    tagaloop 2.0.0/nermal 1.1.2
    Dx/0kPAOET0wWnMObgEXholjOlTo4crOR6S9fSUK
    qQM0aMdYrMB5QuFXF4IjhA==
    tD+WaYOnkb0Dk6ZXtzMDIPM1uIhcD0gJNG2cB6S+Ixh6zj8A8uN3GcGCKFgL+Jr0v7tLdNDzLoOKkrO1/DlVdESKI5GC/hLKjgHJZvl631UqhsnJfosdSAhbloXVDER8XYMLiggZbeLK1+H/89Ve+yuqBoQKu2a/LiZ6RhgNprdencuQ92bU5GEn5X0ca1yGQ1t1iGyToEbYnJ6maVNxG/78lgizhY7FcaqIkXHTs6WRjyoHu4cVSNst514CJcGXuzXPHloIZ/OmVWCaybTQubkN6ZUuvISNOO4pNZI60V5I7EvIt8me7nFNZIbtLWPxQosFB5uO3RvUwGJLideVo0U=
    drostie@signy:/tmp$ ncrypt unbox -p 'Pogo!' example - && echo
    {"t5WV9rS2":[1389376042649,"black","Hello, world!"],"k.1ENkl2":[1389376016251,"blue","1"],"Bubq3fpH":[1389376046957,"red","2"],"Q.F10YwH":[1389376052149,"green","3"],"TIzKZyk2":[1389376066077,"able","4"]}

To install the latest version with wget:

    npm install nermal promptly
    wget -O ~/node_modules/.bin/tagaloop https://raw.github.com/drostie/nermal/master/examples/tagaloop
    chmod 744 ~/node_modules/.bin/tagaloop

## Updating passwords in tagaloop
Tagaloop lacks a couple major features at this moment; one of them is a `copy`
command which would put a string on the clipboard. Another major feature missing
is a way to change the key/password that the file is encrypted with. This is
because the library used by tagaloop for password input (`promptly`) behaves
poorly once the Node library `readline` has been loaded. It's a rare enough
operation that I haven't devoted effort to really fixing it yet.

For now I offer the following workaround: Make sure nobody else is looking at
your screen, and back up your tagaloop file. Open it in tagaloop and use the
`-` debugging command, which can execute arbitrary JavaScript, like so:

    - key=nermal.newKey("Your new passphrase here.");altered=true

Then when you're done with the tagaloop session, remember to save the file and
close the console, so that your password is not publicly visible via scrolling.

# Putting the files in your path
If you want to use these scripts without the full path to the filename, you'll
need to put them in some directory of executables. I recommend
`~/node_modules/.bin`; if this is not in your `$PATH` then you will want to put
it there. To do this for the current session of your console:

    PATH="$PATH":`echo ~/node_modules/.bin`

To do this whenever you start up (e.g.) Bash, you will have to instead use the
`bashrc` file:

    echo 'PATH="$PATH":'`echo ~/node_modules/.bin` >> ~/.bashrc
