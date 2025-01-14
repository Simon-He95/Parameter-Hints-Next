<p align="center">
<img height="200" src="./assets/kv.png" alt="Parameter-Hints">
</p>
<p align="center">English | <a href="./README_zh.md">简体中文</a></p>

>**⚠️Warning:** Since [DominicVonk/VSCode-Parameter-Hints](https://github.com/DominicVonk/VSCode-Parameter-Hints) is not being maintained, I decided to fork it down and continue to maintain it

![Preview](preview.png)

Shows the parameter name of the called function

&nbsp;
&nbsp; 

## Supported languages *
- Javascript
- Javascript React
- Typescript
- Typescript React
- PHP
- Vue

&nbsp; 
\* _Feel free to contribute_

&nbsp;
&nbsp; 

## Settings

|Name|Description|Default|
---|---|---
|`parameterHints.enabled`|Enable Parameter Hints|`true`|
|`parameterHints.hintingType`|Enable Parameter Hints Type|`variableAndType`|
|`parameterHints.languages`|Enable Parameter Hints only for the selected languages|`all`|
|`parameterHints.padding`|Padding|`1 4`|
|`parameterHints.margin`|Margin|`0 1`|

&nbsp;
&nbsp;

## Colors

The background and foreground colors can be customized under 
`workbench.colorCustomizations` like this:

```js
// settings.json
{
    // ...
    "workbench.colorCustomizations": {
        "parameterHints.hintBackground": "#37415180",
        "parameterHints.hintForeground": "#9CA3AF"
    },
}
```

| Name | Description |
---|---
|`parameterHints.hintForeground`|Specifies the foreground color for the hint|
|`parameterHints.hintBackground`|Specifies the background color for the hint|

&nbsp;
&nbsp;

## Commands

|Name|Description|
---|---
|`parameterHints.toggle`|Hide / Show Hints|

&nbsp;
&nbsp;

## Credits
[Dash-AST](https://github.com/goto-bus-stop/dash-ast)
[TypeScript](https://github.com/microsoft/typescript/)
[php-parser](https://github.com/glayzzle/php-parser)

## :coffee:

[buy me a cup of coffee](https://github.com/Simon-He95/sponsor)

## License

[MIT](./license)
